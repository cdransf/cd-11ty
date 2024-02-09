import EleventyFetch from '@11ty/eleventy-fetch'
import AlbumsMock from './json/mocks/albums.js'

const ALBUM_DENYLIST = ['no-love-deep-web', 'unremittance', 'celebratory-beheading']

export default async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=coryd_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const formatAlbumData = (albums) => albums.map((album) => {
    return {
      title: album['name'],
      artist: album['artist']['name'],
      plays: album['playcount'],
      rank: album['@attr']['rank'],
      image: !ALBUM_DENYLIST.includes(album['name'].replace(/\s+/g, '-').toLowerCase())
        ? album['image'][album['image'].length - 1]['#text'].replace(
            'https://lastfm.freetls.fastly.net',
            'https://cd-albums.b-cdn.net'
          )
        : `https://cdn.coryd.dev/albums/${album['name'].replace(/\s+/g, '-').toLowerCase()}.jpg`,
      url: album['mbid']
        ? `https://musicbrainz.org/album/${album['mbid']}`
        : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${album['artist'][
            'name'
          ].replace(/\s+/g, '+')}&tag-lookup.release=${album['name'].replace(/\s+/g, '+')}`,
      type: 'album',
    }
  })

  if (process.env.ELEVENTY_PRODUCTION) {
    const res = EleventyFetch(url, {
      duration: '1h',
      type: 'json',
    }).catch()
    const data = await res
    return formatAlbumData(data['topalbums']['album'])
  } else {
    return formatAlbumData(AlbumsMock);
  }
}
