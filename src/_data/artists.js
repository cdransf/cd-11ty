const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=cdrn_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  return data['topartists'].artist.map((artist) => {
    return {
      name: artist['name'],
      plays: artist['playcount'],
      rank: artist['@attr']['rank'],
      image:
        `https://cdn.coryd.dev/artists/${artist['name'].replace(/\s+/g, '-').toLowerCase()}.jpg` ||
        'https://cdn.coryd.dev/artists/missing-artist.jpg',
      url: artist['mbid']
        ? `https://musicbrainz.org/artist/${artist['mbid']}`
        : `https://rateyourmusic.com/search?searchterm=${encodeURI(artist['name'])}`,
    }
  })
}
