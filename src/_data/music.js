const { AssetCache } = require('@11ty/eleventy-fetch')
const { aliasArtist, sanitizeMedia, sortByPlays } = require('../utils/media')
const { titleCase } = require('../utils/grammar')

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
  const PAGES = 10
  const charts = {
    artists: {},
    albums: {},
    tracks: {},
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
  res.forEach((track) => {
    const formattedArtist = titleCase(aliasArtist(track.attributes['artistName']))
    const formattedAlbum = titleCase(sanitizeMedia(track.attributes['albumName']))
    const formattedTrack = sanitizeMedia(track.attributes['name'])

    if (!charts.artists[formattedArtist]) {
      charts.artists[formattedArtist] = {
        artist: formattedArtist,
        url: `https://rateyourmusic.com/search?searchterm=${encodeURI(formattedArtist)}`,
        plays: 1,
      }
    } else {
      charts.artists[formattedArtist].plays++
    }

    if (!charts.albums[formattedAlbum]) {
      charts.albums[formattedAlbum] = {
        name: formattedAlbum,
        artist: formattedArtist,
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        url: track['relationships']
          ? `https://song.link/${track['relationships'].albums.data.pop().attributes.url}`
          : `https://rateyourmusic.com/search?searchtype=l&searchterm=${encodeURI(
              formattedAlbum
            )}%20${encodeURI(formattedArtist)}`,
        plays: 1,
      }
    } else {
      charts.albums[formattedAlbum].plays++
    }

    if (!charts.tracks[formattedTrack]) {
      charts.tracks[formattedTrack] = {
        name: formattedTrack,
        artist: formattedArtist,
        plays: 1,
      }
    } else {
      charts.tracks[formattedTrack].plays++
    }
  })
  charts.artists = sortByPlays(charts.artists).splice(0, 8)
  charts.albums = sortByPlays(charts.albums).splice(0, 8)
  charts.tracks = sortByPlays(charts.tracks).splice(0, 5)
  await asset.save(charts, 'json')
  return charts
}
