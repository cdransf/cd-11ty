const EleventyFetch = require('@11ty/eleventy-fetch')
const ALBUM_DENYLIST = ['no-love-deep-web', 'unremittance']

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=cdrn_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  return data['topalbums'].album.map((album) => {
    return {
      title: album['name'],
      artist: album['artist']['name'],
      plays: album['playcount'],
      rank: album['@attr']['rank'],
      image: !ALBUM_DENYLIST.includes(album['name'].replace(/\s+/g, '-').toLowerCase())
        ? album['image'][album['image'].length - 1]['#text'].replace(
            'https://lastfm.freetls.fastly.net',
            'https://albums.coryd.dev'
          )
        : `https://cdn.coryd.dev/albums/${album['name'].name
            .replace(/\s+/g, '-')
            .toLowerCase()}.jpg`,
      url: album['mbid']
        ? `https://musicbrainz.org/album/${album['mbid']}`
        : `https://musicbrainz.org/search?query=${encodeURI(album['name'])}&type=release_group`,
      type: 'album',
    }
  })
}
