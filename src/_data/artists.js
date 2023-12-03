const EleventyFetch = require('@11ty/eleventy-fetch')

const mbidMap = (artist) => {
  const map = {
    afi: '1c3919b2-43ca-4a4a-935d-9d50135ec0ef',
    'carpe noctem': 'aa349181-1cb9-4340-bb3f-82eefba3e697',
    cruciamentum: '9a783663-db0c-4237-a3a9-afe72d055ddc',
    'edge of sanity': '82d1972f-f815-480d-ba78-9873b799bdd1',
    fumes: 'a5139ca1-f4f3-4bea-ae4c-ae4e2efd857d',
    ghastly: '70f969df-7fc1-421e-afad-678c0bbd1aea',
    krallice: 'b4e4b359-76a3-447e-be1d-80a24887134e',
    osees: '194272cc-dcc8-4640-a4a6-66da7d250d5c',
    panopticon: 'd9b1f00a-31a7-4f64-9f29-8481e7be8911',
    'pigment vehicle': 'c421f86c-991c-4b2d-9058-516375903deb',
    worm: '6313658e-cd68-4c81-9778-17ce3825748e',
  }
  return map[artist.toLowerCase()] || ''
}

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=coryd_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  return data['topartists']['artist'].map((artist) => {
    let mbid = artist['mbid']

    // mbid mismatches
    if (mbidMap(artist['name']) !== '') mbid = mbidMap(artist['name'])

    return {
      title: artist['name'],
      plays: artist['playcount'],
      rank: artist['@attr']['rank'],
      image:
        `https://cdn.coryd.dev/artists/${artist['name'].replace(/\s+/g, '-').toLowerCase()}.jpg` ||
        'https://cdn.coryd.dev/artists/missing-artist.jpg',
      url: mbid
        ? `https://musicbrainz.org/artist/${mbid}`
        : `https://musicbrainz.org/search?query=${artist['name'].replace(/\s+/g, '+')}&type=artist`,
      type: 'artist',
    }
  })
}
