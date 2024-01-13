---
title: 'Programmatically importing your Last.fm listening data to ListenBrainz'
description: "I love Last.fm, but in the interest of redundancy, Ive started programmatically importing my listening data from Last.fm into ListenBrainz."
date: '2023-12-05'
tags:
- music
- Eleventy
- development
---
I love Last.fm, but in the interest of redundancy, Ive started programmatically importing my listening data from Last.fm into ListenBrainz.<!-- excerpt -->

ListenBrainz offers a handy importer to accomplish this task but it's a manual affair that requires you enter your username and trigger the client-side process on their site.

In my ongoing quest to automate things that don't *really* need to be automated, I went ahead and took a peek at the network traffic on ListenBrainz's import page while the task run. It works by calling Last.fm's API, transforming the data it receives and submitting the listen data to a `submit-listens` endpoint and the timestamp and source of the data to a `latest-import` endpoint.

To faithfully recreate this process I've implemented a similar set of calls in [Eleventy](https://www.11ty.dev/), fetching the plays from Last.fm and then submitting them to ListenBrainz using the exact same calls their importer uses[^1].

```javascript
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

  return {
    listenbrainz_submission: submission,
  }
}
```

Now, every time my site is rebuilt, it'll submit my most recent listening data to ListenBrainz, ensuring that it's stored in more than one place.

[^1]: The "gotcha" here is that you'll need to log in, perform an import, look at the network call and store the token used to authenticate you (e.g. `Authorization: Token <VALUE WE CARE ABOUT>`).
