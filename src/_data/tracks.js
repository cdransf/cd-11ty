const EleventyFetch = require('@11ty/eleventy-fetch')
const mbidPatches = require('./json/mbid-patches.json')

const mbidMap = (artist) => {
  return mbidPatches[artist.toLowerCase()] || ''
}

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const LISTENBRAINZ_TOKEN = process.env.LISTENBRAINZ_TOKEN
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=coryd_&api_key=${MUSIC_KEY}&format=json&limit=200`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  const submission = data['recenttracks']['track'].map((track) => {
    let artistMbid = track['artist']['mbid']['mbid']

    // mbid mismatches
    if (mbidMap(track['artist']['#text']) !== '') artistMbid = mbidMap(track['artist']['#text'])

    return {
      track_metadata: {
        track_name: track['name'],
        artist_name: track['artist']['#text'],
        release_name: track['album']['#text'],
        additional_info: {
          submission_client: 'coryd.dev last.fm importer',
          lastfm_track_mbid: track['mbid'],
          lastfm_release_mbid: track['album']['mbid'],
          lastfm_artist_mbid: artistMbid,
        },
      },
      listened_at: track['date']['uts'],
    }
  })

  await fetch('https://api.listenbrainz.org/1/submit-listens', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${LISTENBRAINZ_TOKEN}`,
    },
    body: JSON.stringify({
      listen_type: 'import',
      payload: submission,
    }),
  })

  await fetch('https://api.listenbrainz.org/1/latest-import', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${LISTENBRAINZ_TOKEN}`,
    },
    body: JSON.stringify({
      service: 'lastfm',
      ts: submission[0]['listened_at'],
    }),
  })
  console.log({
    listenbrainz_submission: submission,
  })
  return {
    listenbrainz_submission: submission,
  }
}
