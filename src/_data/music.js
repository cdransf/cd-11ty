const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const _ = require('lodash')
const { AssetCache } = require('@11ty/eleventy-fetch')
const artistAliases = require('./json/artist-aliases.json')
const titleCaseExceptions = require('./json/title-case-exceptions.json')
const { getReadableData } = require('../utils/aws')

const aliasArtist = (artist) => {
  const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(artist))
  if (aliased) artist = aliased.artist
  return artist
}

const sanitizeMedia = (media) => {
  const denyList =
    /-\s*(?:single|ep)\s*|(\[|\()(Deluxe Edition|Special Edition|Remastered|Full Dynamic Range Edition|Anniversary Edition)(\]|\))/gi
  return media.replace(denyList, '').trim()
}

const titleCase = (string) => {
  if (!string) return ''
  return string
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      return titleCaseExceptions.exceptions.includes(word) && i !== 0
        ? word
        : word.charAt(0).toUpperCase().concat(word.substring(1))
    })
    .join(' ')
}

const sortByPlays = (array) => Object.values(array).sort((a, b) => b.plays - a.plays)

const diffTracks = (cache, tracks) => {
  const trackCompareSet = Object.values(tracks)
  const cacheCompareSet = Object.values(cache).sort((a, b) => a.time - b.time)
  const diffedTracks = {}

  const ONE_HOUR_MS = 3600000
  const tracksOneHour = []
  let trackIndex = 0
  let trackTimer = 0

  while (trackTimer < ONE_HOUR_MS) {
    trackTimer = trackTimer + parseInt(trackCompareSet[trackIndex].duration)
    tracksOneHour.push(trackCompareSet[trackIndex])
    trackIndex++
  }
  const comparedTracks = _.differenceWith(
    tracksOneHour,
    cacheCompareSet.slice(-tracksOneHour.length),
    (a, b) => _.isEqual(a.id, b.id)
  )

  for (let i = 0; i < comparedTracks.length; i++)
    diffedTracks[`${comparedTracks[i]?.id}-${comparedTracks[i].time}`] = comparedTracks[i]

  return diffedTracks
}

const formatTracks = (tracks, time) => {
  let formattedTracks = {}
  Object.values(tracks).forEach((track) => {
    const artistFormatted = titleCase(aliasArtist(track.attributes['artistName']))
    const albumFormatted = titleCase(sanitizeMedia(track.attributes['albumName']))
    const trackFormatted = sanitizeMedia(track.attributes['name'])
    if (!formattedTracks[track.attributes.name]) {
      formattedTracks[track.attributes.name] = {
        name: trackFormatted,
        artist: artistFormatted,
        album: albumFormatted,
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        url:
          track['relationships'] && track['relationships'].albums.data.length > 0
            ? `https://song.link/${track['relationships'].albums.data.pop().attributes.url}`
            : `https://rateyourmusic.com/search?searchtype=l&searchterm=${encodeURI(
                albumFormatted
              )}%20${encodeURI(artistFormatted)}`,
        id: track.id,
        time,
        duration: track.attributes['durationInMillis'],
      }
    } else {
      formattedTracks[track.attributes.name].plays++
    }
  })
  return formattedTracks
}

const deriveCharts = (tracks) => {
  const charts = {
    artists: {},
    albums: {},
  }
  const tracksForLastWeek = Object.values(tracks).filter((track) => {
    const currentDate = new Date()
    const currentDateTime = new Date().getTime()
    const lastWeek = new Date(currentDate.setDate(currentDate.getDate() - 7))
    const lastWeekDateTime = lastWeek.getTime()
    const trackDateTime = new Date(track.time).getTime()
    return trackDateTime <= currentDateTime && trackDateTime > lastWeekDateTime
  })

  tracksForLastWeek.forEach((track) => {
    if (!charts.artists[track.artist]) {
      charts.artists[track.artist] = {
        artist: track.artist,
        url: `https://rateyourmusic.com/search?searchterm=${encodeURI(track.artist)}`,
        plays: 1,
      }
    } else {
      charts.artists[track.artist].plays++
    }

    if (!charts.albums[track.album]) {
      charts.albums[track.album] = {
        name: track.album,
        artist: track.artist,
        art: track.art,
        url: track.url,
        plays: 1,
      }
    } else {
      charts.albums[track.album].plays++
    }
  })

  return charts
}

module.exports = async function () {
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_WASABI,
      secretAccessKey: process.env.SECRET_KEY_WASABI,
    },
    endpoint: {
      url: 'https://s3.us-west-1.wasabisys.com',
    },
    region: 'us-west-1',
  })
  const WASABI_BUCKET = process.env.BUCKET_WASABI
  const APPLE_BEARER = process.env.API_BEARER_APPLE_MUSIC
  const APPLE_MUSIC_TOKEN = process.env.API_TOKEN_APPLE_MUSIC
  const APPLE_TOKEN_RESPONSE = await fetch(process.env.APPLE_RENEW_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${APPLE_BEARER}`,
      'X-Apple-Music-User-Token': APPLE_MUSIC_TOKEN,
    },
  })
    .then((data) => data.json())
    .catch()
  const APPLE_TOKEN = APPLE_TOKEN_RESPONSE['music-token']
  const asset = new AssetCache('recent_tracks_data')
  const PAGE_SIZE = 30
  const PAGES = 10
  const time = Number(new Date())
  let charts = {
    artists: {},
    albums: {},
  }
  let CURRENT_PAGE = 0
  let res = []
  let hasNextPage = true

  if (asset.isCacheValid('1h')) return await asset.getCachedValue()

  while (CURRENT_PAGE < PAGES && hasNextPage) {
    const URL = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${PAGE_SIZE}&offset=${
      PAGE_SIZE * CURRENT_PAGE
    }&include[songs]=albums&extend=artistUrl`
    const tracks = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPLE_BEARER}`,
        'music-user-token': `${APPLE_TOKEN}`,
      },
    })
      .then((data) => data.json())
      .catch()
    if (!tracks.next) hasNextPage = false
    if (tracks.data.length) res = [...res, ...tracks.data]
    CURRENT_PAGE++
  }

  const cachedTracksOutput = await client.send(
    new GetObjectCommand({
      Bucket: WASABI_BUCKET,
      Key: 'music.json',
    })
  )
  const cachedTracksData = getReadableData(cachedTracksOutput.Body)
  const cachedTracks = await cachedTracksData.then((tracks) => JSON.parse(tracks)).catch()
  const updatedCache = {
    ...cachedTracks,
    ...diffTracks(cachedTracks, formatTracks(res, time)),
  }
  charts = deriveCharts(updatedCache)
  charts.artists = sortByPlays(charts.artists).splice(0, 8)
  charts.albums = sortByPlays(charts.albums).splice(0, 8)

  await client.send(
    new PutObjectCommand({
      Bucket: WASABI_BUCKET,
      Key: 'music.json',
      Body: JSON.stringify(updatedCache),
    })
  )
  await asset.save(charts, 'json')

  return charts
}
