const { AssetCache } = require('@11ty/eleventy-fetch')

const sortTrim = (array, length = 5) =>
  Object.values(array)
    .sort((a, b) => b.plays - a.plays)
    .splice(0, length)

module.exports = async function () {
  const APPLE_BEARER = process.env.API_BEARER_APPLE_MUSIC
  const APPLE_TOKEN = process.env.API_TOKEN_APPLE_MUSIC
  const asset = new AssetCache('recent_tracks_data')
  const PAGE_SIZE = 30
  const PAGES = 4
  const response = {
    artists: {},
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
    if (!response.artists[track.attributes.artistName]) {
      response.artists[track.attributes.artistName] = {
        name: track.attributes.artistName,
        plays: 1,
      }
    } else {
      response.artists[track.attributes.artistName].plays++
    }

    // aggregate tracks
    if (!response.tracks[track.attributes.name]) {
      response.tracks[track.attributes.name] = {
        name: track.attributes.name,
        plays: 1,
      }
    } else {
      response.tracks[track.attributes.name].plays++
    }
  })
  response.artists = sortTrim(response.artists, 4)
  response.tracks = sortTrim(response.tracks)
  await asset.save(response, 'json')
  return response
}
