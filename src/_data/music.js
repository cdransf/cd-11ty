const { AssetCache } = require('@11ty/eleventy-fetch')
const { aliasArtist, sanitizeMedia, sortByPlays } = require('../utils/media')

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
    }&include[songs]=albums&extend=artistUrl`
    const tracks = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
        'music-user-token': `${RENEWED_MUSIC_TOKEN['music-token']}`,
      },
    })
      .then((data) => data.json())
      .catch()
    res = tracks['data']?.length ? [...res, ...tracks['data']] : [...res]
    CURRENT_PAGE++
  }

  res.forEach((track) => {
    const artist = aliasArtist(track['attributes']['artistName'])
    const album = sanitizeMedia(track['attributes']['albumName'])
    if (!response['artists'][artist]) {
      response['artists'][artist] = {
        title: artist,
        image: `https://cdn.coryd.dev/artists/${track['attributes']['artistName']
          .replace(/\s+/g, '-')
          .toLowerCase()}.jpg`,
        url: track['attributes']['artistUrl']
          ? track['attributes']['artistUrl']
          : `https://musicbrainz.org/search?query=${track['attributes']['artistName'].replace(
              /\s+/g,
              '+'
            )}&type=artist`,
        plays: 1,
        type: 'artist',
      }
    } else {
      response['artists'][artist].plays++
    }

    // aggregate albums
    if (!response.albums[album]) {
      response.albums[album] = {
        title: album,
        artist: aliasArtist(track['attributes']['artistName']),
        image: track['attributes']['artwork']['url'].replace('{w}', '500').replace('{h}', '500'),
        url:
          track['relationships'] && track['relationships'].albums.data.length > 0
            ? track['relationships'].albums.data.pop().attributes.url
            : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['attributes'][
                'artistName'
              ].replace(/\s+/g, '+')}&tag-lookup.release=${album.replace(/\s+/g, '+')}`,
        plays: 1,
        type: 'album',
      }
    } else {
      response.albums[album].plays++
    }
  })
  response.artists = sortByPlays(response.artists)
  response.albums = sortByPlays(response.albums)
  await asset.save(response, 'json')
  return response
}
