const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const _ = require('lodash')
const artistAliases = require('./json/artist-aliases.json')
const artistGenres = require('./json/artist-genres.json')
const titleCaseExceptions = require('./json/title-case-exceptions.json')
const { getReadableData } = require('../utils/aws')
const { getKeyByValue } = require('../utils/arrays')

/**
 * Accepts a string representing an artist name, checks to see if said artist name
 * exists in an artist alias group of shape string[]. If so, replaces the provided
 * artist name with the canonical artist name.
 *
 * @name aliasArtist
 * @param {string} artist
 * @returns {string}
 */
const aliasArtist = (artist) => {
  const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(artist))
  if (aliased) artist = aliased.artist
  return artist
}

/**
 * Accepts a media name represented as a string (album or song name) and replaces
 * matches in the `denyList` with an empty string before returning the result.
 *
 * @name sanitizeMedia
 * @param {string} media
 * @returns {string}
 */
const sanitizeMedia = (media) => {
  const denyList =
    /-\s*(?:single|ep)\s*|(\[|\()(Deluxe Edition|Special Edition|Remastered|Full Dynamic Range Edition|Anniversary Edition)(\]|\))/gi
  return media.replace(denyList, '').trim()
}

/**
 * Accepts a string that is then transformed to title case and returned.
 *
 * @name titleCase
 * @param {string} string
 * @returns {string}
 */
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

const getTracksOneHour = (tracks) => {
  const TIMER_CEILING = 3600000 // 1 hour
  const tracksOneHour = []
  let trackIndex = 0
  let trackTimer = 0

  while (trackTimer < TIMER_CEILING) {
    trackTimer = trackTimer + parseInt(tracks[trackIndex].duration)
    tracksOneHour.push(tracks[trackIndex])
    trackIndex++
  }

  return tracksOneHour
}

const diffTracks = (cache, tracks) => {
  const trackCompareSet = Object.values(tracks)
  const cacheCompareSet = _.orderBy(Object.values(cache), ['time'], ['desc'])
  const diffedTracks = {}
  const cacheCompareOneHour = getTracksOneHour(cacheCompareSet)
  const comparedTracks = _.differenceWith(trackCompareSet, cacheCompareOneHour, (a, b) =>
    _.isEqual(a.id, b.id)
  )

  for (let i = 0; i < comparedTracks.length; i++)
    diffedTracks[`${comparedTracks[i]?.id}-${comparedTracks[i].playTime}`] = comparedTracks[i]

  return diffedTracks
}

const formatTracks = (tracks) => {
  let formattedTracks = {}
  let time = new Date().getTime()

  Object.values(tracks).forEach((track) => {
    const artistFormatted = titleCase(aliasArtist(track.attributes['artistName']))
    const albumFormatted = titleCase(sanitizeMedia(track.attributes['albumName']))
    const trackFormatted = sanitizeMedia(track.attributes['name'])
    formattedTracks[`${track.id}-${time}`] = {
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
      playTime: time - parseInt(track.attributes['durationInMillis']),
      duration: parseInt(track.attributes['durationInMillis']),
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
    const trackDateTime = new Date(track.playTime).getTime()
    return trackDateTime <= currentDateTime && trackDateTime > lastWeekDateTime
  })

  tracksForLastWeek.forEach((track) => {
    if (!charts.artists[track.artist]) {
      charts.artists[track.artist] = {
        artist: track.artist,
        genre: getKeyByValue(artistGenres, track.artist.replace(/\s+/g, '-').toLowerCase()),
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
  const PAGE_SIZE = 30
  const TIMER_CEILING = 3600000 // 1 hour
  let charts
  let CURRENT_PAGE = 0
  let trackTimer = 0
  let res = []

  while (trackTimer < TIMER_CEILING) {
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

    tracks.data.forEach((track) => {
      trackTimer = trackTimer + parseInt(track.attributes['durationInMillis'])
      if (trackTimer >= TIMER_CEILING) return
      res.push(track)
    })
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
  const diffedTracks = diffTracks(cachedTracks, formatTracks(res))
  const updatedCache = {
    ...cachedTracks,
    ...diffedTracks,
  }
  charts = deriveCharts(updatedCache)
  charts.artists = _.orderBy(Object.values(charts.artists), ['plays'], ['desc']).splice(0, 8)
  charts.albums = _.orderBy(Object.values(charts.albums), ['plays'], ['desc']).splice(0, 8)

  if (!_.isEmpty(diffedTracks) && process.env.ELEVENTY_PRODUCTION === 'true') {
    await client.send(
      new PutObjectCommand({
        Bucket: WASABI_BUCKET,
        Key: 'music.json',
        Body: JSON.stringify(updatedCache),
      })
    )
  }

  return charts
}
