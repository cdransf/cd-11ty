const { AssetCache } = require('@11ty/eleventy-fetch')

const sortTrim = (array, length = 8) =>
  Object.values(array)
    .sort((a, b) => b.plays - a.plays)
    .splice(0, length)

module.exports = async function () {
  const API_APPLE_MUSIC_DEVELOPER_TOKEN = process.env.API_APPLE_MUSIC_DEVELOPER_TOKEN
  const API_APPLE_MUSIC_USER_TOKEN = process.env.API_APPLE_MUSIC_USER_TOKEN
  const APPLE_RENEW_TOKEN_URL = process.env.APPLE_RENEW_TOKEN_URL
  const asset = new AssetCache('recent_tracks_data')
  const PAGE_SIZE = 30
  const PAGES = 8
  const response = {
    artists: {},
    albums: {},
    tracks: {},
  }

  const RENEWED_MUSIC_TOKEN = await fetch(APPLE_RENEW_TOKEN_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
      'X-Apple-Music-User-Token': `${API_APPLE_MUSIC_USER_TOKEN}`,
    },
  })
    .then((data) => data.json())
    .catch()

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
        Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
        'music-user-token': `${RENEWED_MUSIC_TOKEN['music-token']}`,
      },
    })
      .then((data) => data.json())
      .catch()
    res = [...res, ...tracks['data']]
    CURRENT_PAGE++
  }

  res.forEach((track) => {
    if (!response['artists'][track['attributes']['artistName']]) {
      response['artists'][track['attributes']['artistName']] = {
        title: track['attributes']['artistName'],
        image:
          `https://cdn.coryd.dev/artists/${track['attributes']['artistName']
            .replace(/\s+/g, '-')
            .toLowerCase()}.jpg` || 'https://cdn.coryd.dev/artists/missing-artist.jpg',
        url: `https://musicbrainz.org/search?query=${track['attributes']['artistName'].replace(
          /\s+/g,
          '+'
        )}&type=artist`,
        plays: 1,
        type: 'artist',
      }
    } else {
      response['artists'][track['attributes']['artistName']].plays++
    }

    // aggregate albums
    if (!response.albums[track['attributes']['albumName']]) {
      response.albums[track['attributes']['albumName']] = {
        title: track['attributes']['albumName'],
        artist: track['attributes']['artistName'],
        image: track['attributes']['artwork']['url'].replace('{w}', '300').replace('{h}', '300'),
        url: `https://musicbrainz.org/search?query=${track['attributes']['albumName'].replace(
          /\s+/g,
          '+'
        )}&type=recording`,
        plays: 1,
        type: 'album',
      }
    } else {
      response.albums[track['attributes']['albumName']].plays++
    }

    // aggregate tracks
    if (!response.tracks[track['attributes']['name']]) {
      response.tracks[track['attributes']['name']] = {
        name: track['attributes']['name'],
        plays: 1,
      }
    } else {
      response.tracks[track['attributes']['name']].plays++
    }
  })
  response.artists = sortTrim(response.artists)
  response.albums = sortTrim(response.albums)
  response.tracks = sortTrim(response.tracks, 5)
  await asset.save(response, 'json')
  return response
}
