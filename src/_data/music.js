const { AssetCache } = require('@11ty/eleventy-fetch')
const artistAliases = require('./json/artist-aliases.json')

const aliasArtist = (artist) => {
  const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(artist))
  if (aliased) artist = aliased.artist
  return artist
}

const sanitizeAlbum = (album) => {
  const denyList = /(\[|\()(Deluxe Edition|Special Edition|Remastered)(\]|\))/i
  return album.replace(denyList, '')
}

const titleCase = (string) => {
  const exceptions = ['of', 'the', 'and']
  if (!string) return ''
  return string
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      return exceptions.includes(word) && i !== 0
        ? word
        : word.charAt(0).toUpperCase().concat(word.substring(1))
    })
    .join(' ')
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
  const PAGES = 10
  const response = {
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
    const artist = titleCase(aliasArtist(track.attributes['artistName']))
    const album = titleCase(sanitizeAlbum(track.attributes['albumName']))
    if (!response.artists[artist]) {
      response.artists[artist] = {
        artist,
        plays: 1,
      }
    } else {
      response.artists[artist].plays++
    }

    if (!response.albums[album]) {
      response.albums[album] = {
        name: album,
        artist,
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        url: track['relationships']
          ? `https://song.link/${track['relationships'].albums.data.pop().attributes.url}`
          : `https://rateyourmusic.com/search?searchtype=l&searchterm=${album}%20${artist}`,
        plays: 1,
      }
    } else {
      response.albums[album].plays++
    }

    if (!response.tracks[track.attributes.name]) {
      response.tracks[track.attributes.name] = {
        name: track.attributes.name,
        artist,
        plays: 1,
      }
    } else {
      response.tracks[track.attributes.name].plays++
    }
  })
  response.artists = sort(response.artists).splice(0, 8)
  response.albums = sort(response.albums).splice(0, 8)
  response.tracks = sort(response.tracks).splice(0, 5)
  await asset.save(response, 'json')
  return response
}
