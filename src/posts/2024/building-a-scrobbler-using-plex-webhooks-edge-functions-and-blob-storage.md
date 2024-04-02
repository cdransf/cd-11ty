---
date: '2024-04-02T09:30-08:00'
title: 'Building a scrobbler using Plex webhooks, edge functions and blob storage
'
description: "I've written before about embedding music into my site and I've largely used Last.fm to do so. Their API is rather extensive, though it is showing its age — the default response format is XML, they've dropped artist images and have intermittently failed to return album art. ListenBrainz is great, but client support is still lacking. I've also tried charting Apple Music data from their (quite limited) API."
tags: ['Eleventy', 'development', 'music', 'indie web', 'javascript', 'Plex', 'Plexamp', 'Netlify']
---
I've written before about [embedding music into my site](https://coryd.dev/posts/2024/weaving-music-in-and-out-of-my-personal-site/) and I've largely used Last.fm to do so. Their API is rather extensive, though it is showing its age — the default response format is XML, they've dropped artist images and have intermittently failed to return album art. ListenBrainz is *great*, but client support is still lacking. [I've also tried charting Apple Music data from their (quite limited) API.](https://coryd.dev/posts/2023/road-to-madness-apple-music-charts/)<!-- excerpt -->

I could have kept depending on Last.fm and — don't get me wrong — I love Last.fm. It's one of those valuable, legacy services that's hanging on with a rich user base and historical recommendations. I'm going to keep scrobbling data there and to ListenBrainz[^1].

{% image 'https://cdn.coryd.dev/blog/scrobbler.png', 'A diagram of the scrobbling architecture', 'image__banner', 'eager' %}

What I've long wanted is something that sits on infrastructure I control, stores my own data and lets me present roughly the same data. Given that Plex will issue outbound webhooks, I thought I'd set up an edge function over at Netlify and point a webhook at it to see what I could do with the inbound payload. What Plex sends is fairly lightweight and ended up needing to be read in from form data on the `POST`, but it was enough to work with.

Next, I went to work developing the edge function that would receive and deal with the data. I'm leveraging `luxon` for dealing with dates and [Netlify Blobs](https://docs.netlify.com/blobs/overview/) for persistence. I have a few different helper functions on hand as well:

```javascript
const sanitizeMediaString = (string) => string.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '');

const weekKey = () => {
  const currentDate = DateTime.now();
  return `${currentDate.year}-${currentDate.weekNumber}`
}

const filterOldScrobbles = (scrobbles) => {
  const windowEnd = DateTime.now().minus({ days: 7 });
  return scrobbles.filter(scrobble => {
    const timestamp = DateTime.fromISO(scrobble.timestamp);
    return timestamp >= windowEnd;
  });
}
```

The first sanitizes content strings, normalizing diacritics and removing characters that may break URLs when using the resulting string — artist and album images are stored on a CDN and this normalization allows me to match the generated string to the correct image URI. The second generates a consistently formatted key for each week so that scrobbles can be stored in per week blobs. The last filters old scrobbles to create a moving window of time for the chart data displayed on [my now page](https://coryd.dev/now).

Next, in a basic declaration for the edge function `(export default async (request)…` we initialize environmental variables, check for my Plex account ID to verify the request and issue responses based on incorrect or missing `ID` values:

```javascript
const ACCOUNT_ID_PLEX = Netlify.env.get('ACCOUNT_ID_PLEX');
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM');
  const params = new URL(request['url']).searchParams
  const id = params.get('id')

  if (!id) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
```

Moving on, we handle the webhook form data and set up our blob store variables:

```javascript
const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))
  const artists = getStore('artists')
  const albums = getStore('albums')
  const scrobbles = getStore('scrobbles')
```

If the event sent from Plex is of the type `media.scrobble` we need to handle it:

```javascript
if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const trackNumber = payload['Metadata']['index']
    const timestamp = DateTime.now()
    const artistsMap = await artists.get('artists-map', { type: 'json' })
    const albumsMap = await albums.get('albums-map', { type: 'json' })
    const artistSanitizedKey = `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
    const albumSanitizedKey = `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`
    let artistInfo = artistsMap[artistSanitizedKey]
```

This caches the basic track info for the scrobble that we need to record it, creates sanitized keys and gets the objects we've stored to persist artist and album metadata (`artistsMap` and `albumsMap`, respectively).

If we don't yet have metadata cached for an artist or an album, we use the Last.fm API to get the MusicBrainz ID for the artist or album, then, for artist, fetch the genre from MusicBrainz based on the ID returned from Last.fm. For artists, this looks like the following:

```javascript
// if there is no artist blob, populate one
    if (!artistsMap[artistSanitizedKey]) {
      const artistRes = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=${MUSIC_KEY}&artist=${sanitizeMediaString(artist).replace(/\s+/g, '+').toLowerCase()}&format=json`,
        {
          type: "json",
        }
      ).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the Last.fm endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const mbidRes = await fetch("https://coryd.dev/api/mbids", {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the mbid endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const artistData = artistRes['artist'];
      let mbid = artistData['mbid']
      const mbidMap = () => mbidRes[artistData['name'].toLowerCase()] || '';

      // mbid mismatches
      if (mbidMap() !== "") mbid = mbidMap();

      const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`;
      const genreRes = await fetch(genreUrl, {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the MusicBrainz endpoint.');
      }).catch(err => {
        console.log(err);
        return {}
      });
      const genre = genreRes['genres'].sort((a, b) => b.count - a.count)[0]?.['name'] || '';
      const artistObj = {
        mbid,
        genre,
        image: `https://cdn.coryd.dev/artists/${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}.jpg`
      }
      artistInfo = artistObj
      artistsMap[artistSanitizedKey] = artistObj
      await artists.setJSON('artists-map', artistsMap)
    }
```

This will be skipped on subsequent plays for the artist as we'll already have the information we need. Finally, we store our data:

```javascript
    // scrobble logic
    const trackScrobbleData = {
      track,
      album,
      artist,
      trackNumber,
      timestamp,
      genre: artistInfo?.['genre'] || ''
    }
    const scrobbleData = await scrobbles.get(`${weekKey()}`, { type: 'json'})
    const windowData = await scrobbles.get('window', { type: 'json'})
    await scrobbles.setJSON('now-playing', {...trackScrobbleData, ...{ url: `https://musicbrainz.org/artist/${artistInfo?.['mbid']}`}})
    let scrobbleUpdate = scrobbleData
    let windowUpdate = windowData;
    if (scrobbleUpdate?.['data']) scrobbleUpdate['data'].push(trackScrobbleData)
    if (!scrobbleUpdate?.['data']) scrobbleUpdate = { data: [trackScrobbleData] }
    if (windowData?.['data']) windowUpdate['data'].push(trackScrobbleData)
    if (!windowData?.['data']) windowUpdate = { data: [trackScrobbleData] }
    windowUpdate = { data: filterOldScrobbles(windowUpdate.data) }
    await scrobbles.setJSON(`${weekKey()}`, scrobbleUpdate)
    await scrobbles.setJSON('window', windowUpdate)
```

We construct a `trackScrobbleData` object, merge our new scrobble with the data for the moving window of plays and current week and populate a `now-playing` blob that is now retrieved to populate [the dynamic check in component on my home page](https://coryd.dev/posts/2023/check-in-to-your-personal-site/).

We're now accepting and storing scrobble data from Plex, hydrating our own metadata for media from Last.fm and MusicBrainz. Next, we need to use it. I created a `buildChart` helper to create a chart object that I can consume and display:

```javascript
export const buildChart = (tracks, artists, albums) => {
  const artistsData = {}
  const albumsData = {}
  const tracksData = {}
  const artistSanitizedKey = (artist) => `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
  const albumSanitizedKey = (album) => `${sanitizeMediaString(album).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`
  const objectToArraySorted = (inputObject) => Object.values(inputObject).sort((a, b) => b.plays - a.plays)

  tracks.forEach(track => {
    if (!tracksData[track['track']]) {
      tracksData[track['track']] = {
        title: track['track'],
        plays: 1,
        type: 'track'
      }
    } else {
      tracksData[track['track']]['plays']++
    }

    if (!artistsData[artistCapitalization(track['artist'])]) {
      artistsData[artistCapitalization(track['artist'])] = {
        title: artistCapitalization(track['artist']),
        plays: 1,
        mbid: artists[artistSanitizedKey(track['artist'])]?.['mbid'] || '',
        url: artists[artistSanitizedKey(track['artist'])]?.['url'] || `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
        image: artists[artistSanitizedKey(track['artist'])]?.['image'] || `https://cdn.coryd.dev/artists/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}.jpg`,
        type: 'artist'
      }
    } else {
      artistsData[artistCapitalization(track['artist'])]['plays']++
    }

    if (!albumsData[track['album']]) {
      albumsData[track['album']] = {
        title: track['album'],
        artist: artistCapitalization(track['artist']),
        plays: 1,
        mbid: albums[albumSanitizedKey(track['album'])]?.['mbid'] || '',
        url: albums[albumSanitizedKey(track['album'])]?.['url'] || `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['artist'].replace(/\s+/g, '+')}&tag-lookup.release=${track['album'].replace(/\s+/g, '+')}`,
        image: albums[albumSanitizedKey(track['album'])]?.['image'] || `https://cdn.coryd.dev/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg`,
        type: 'album'
      }
    } else {
      albumsData[track['album']]['plays']++
    }
  })

  return {
    artists: objectToArraySorted(artistsData),
    albums: objectToArraySorted(albumsData),
    tracks: objectToArraySorted(tracksData),
  }
}
```

This iterates through an array of track data, populating initial track, artist and album data in the returned chart object and incrementing the play count in the initialized data when a subsequent play is encountered. We also attach metadata, generate artist and album urls, along with artist and album image URLs. The final object has artist, album and track keys, each of which is an array of sorted objects in descending order based on the play count.

The data to be passed through this helper is returned from an edge function, that fetches the scobble data, artist and album maps and returns all said data at build time:

```javascript
import { getStore } from '@netlify/blobs'

export default async (request) => {
  const API_KEY_MUSIC = Netlify.env.get('API_KEY_MUSIC');
  const params = new URL(request['url']).searchParams
  const key = params.get('key')
  const week = params.get('week')

  if (!key) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (key !== API_KEY_MUSIC) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  const scrobbles = getStore('scrobbles')
  const scrobbleData = []
  const artists = getStore('artists')
  const albums = getStore('albums')
  const artistsMap = await artists.get('artists-map', { type: 'json' })
  const albumsMap = await albums.get('albums-map', { type: 'json' })

  if (week) {
    const weekData = await scrobbles.get(week, { type: 'json'})
    scrobbleData.push(...weekData['data'])
  } else {
    const windowData = await scrobbles.get('window', { type: 'json'})
    scrobbleData.push(...windowData['data'])
  }

  return new Response(JSON.stringify({
    scrobbles: scrobbleData,
    artists: artistsMap,
    albums: albumsMap
  }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/music',
}
```

Finally, the 11ty data file that surfaces this all at build time and leverages our `buildChart` helper:

```javascript
import EleventyFetch from '@11ty/eleventy-fetch';
import { buildChart } from './helpers/music.js'

export default async function () {
  const API_KEY_MUSIC = process.env.API_KEY_MUSIC;
  const url = `https://coryd.dev/api/music?key=${API_KEY_MUSIC}`;
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch();
  const resObj = await res;
  return buildChart(resObj['scrobbles'], resObj['artists'], resObj['albums'])
}
```

With all that in place, when I play a track using Plexamp it's scrobbled to my site, updates my window, scrobble and now-playing stores and allows my displayed artist data to be updated at build time and when my now playing edge function runs.

[^1]: Via [eavesdrop.fm](https://eavesdrop.fm/).