const { AssetCache } = require('@11ty/eleventy-fetch')
const artistAliases = require('./json/artist-aliases.json')

const aliasArtists = (array) => {
  array.forEach((a) => {
    const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(a.artist))
    if (aliased) a.artist = aliased.artist
  })
  return array
}

const sort = (array) => Object.values(array).sort((a, b) => b.plays - a.plays)

module.exports = async function () {
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
  const PAGES = 7
  const response = {
    artists: {},
    albums: {},
    tracks: {},
  }

  let CURRENT_PAGE = 0
  let res = []

  if (asset.isCacheValid('1h')) return await asset.getCachedValue()

  while (CURRENT_PAGE < PAGES) {
    const URL = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${PAGE_SIZE}&offset=${
      PAGE_SIZE * CURRENT_PAGE
    }`
    const tracks = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPLE_BEARER}`,
        'music-user-token': `${APPLE_TOKEN}`,
      },
    })
      .then((data) => data.json())
      .catch()
    res = [...res, ...tracks.data]
    CURRENT_PAGE++
  }

  res.forEach((track) => {
    // aggregate artists
    if (!response.artists[track.attributes['artistName']]) {
      response.artists[track.attributes['artistName']] = {
        artist: track.attributes['artistName'],
        plays: 1,
      }
    } else {
      response.artists[track.attributes['artistName']].plays++
    }

    // aggregate albums
    if (!response.albums[track.attributes['albumName']]) {
      response.albums[track.attributes['albumName']] = {
        name: track.attributes['albumName'],
        artist: track.attributes['artistName'],
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        plays: 1,
      }
    } else {
      response.albums[track.attributes['albumName']].plays++
    }

    // aggregate tracks
    if (!response.tracks[track.attributes.name]) {
      response.tracks[track.attributes.name] = {
        name: track.attributes.name,
        artist: track.attributes['artistName'],
        plays: 1,
      }
    } else {
      response.tracks[track.attributes.name].plays++
    }
  })
  response.artists = aliasArtists(sort(response.artists)).splice(0, 8)
  response.albums = aliasArtists(sort(response.albums)).splice(0, 8)
  response.tracks = aliasArtists(sort(response.tracks)).splice(0, 5)
  await asset.save(response, 'json')
  return response
}
