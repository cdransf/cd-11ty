const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const _ = require('lodash')
const mockedMusic = require('./json/mocks/music.json')
const { getReadableData } = require('../utils/aws')
const { aliasArtist, sanitizeMedia } = require('../utils/media')
const { titleCase } = require('../utils/grammar')

const diffTracks = (cache, tracks) => {
  const trackCompareSet = Object.values(tracks)
  const cacheCompareSet = _.orderBy(Object.values(cache), ['time'], ['desc'])
  const diffedTracks = {}
  const comparedTracks = _.differenceWith(trackCompareSet, cacheCompareSet, (a, b) =>
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
      genre: track['relationships']?.['library'].data[0]?.attributes['genreNames'][0] || '',
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

  Object.values(tracks).forEach((track) => {
    if (!charts.artists[track.artist]) {
      charts.artists[track.artist] = {
        artist: track.artist,
        genre: track.genre,
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

  const DATE = new Date()
  DATE.setDate(DATE.getDate() + ((7 - DATE.getDay()) % 7))
  const DATE_STAMP = `${DATE.getFullYear()}-${DATE.getDate()}-${DATE.getMonth()}`

  const APPLE_TOKEN = APPLE_TOKEN_RESPONSE['music-token']
  const PAGE_SIZE = 30
  const PAGES = 10

  let charts
  let CURRENT_PAGE = 0
  let hasNextPage = true
  let res = []
  let cachedTracks = mockedMusic

  while (CURRENT_PAGE < PAGES && hasNextPage) {
    const URL = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${PAGE_SIZE}&offset=${
      PAGE_SIZE * CURRENT_PAGE
    }&include[songs]=albums,library&extend=artistUrl`
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

  if (process.env.ELEVENTY_PRODUCTION === 'true') {
    try {
      const cachedTracksOutput = await client.send(
        new GetObjectCommand({
          Bucket: WASABI_BUCKET,
          Key: `${DATE_STAMP}-music-history.json`,
        })
      )
      const cachedTracksData = getReadableData(cachedTracksOutput.Body)
      cachedTracks = await cachedTracksData.then((tracks) => JSON.parse(tracks)).catch()
    } catch (e) {
      console.log('No cached tracks')
      cachedTracks = {}
    }
  }

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
        Key: `${DATE_STAMP}-music-history.json`,
        Body: JSON.stringify(updatedCache),
      })
    )
  }

  return charts
}
