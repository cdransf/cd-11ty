---
date: 2024-05-08T11:48-08:00
title: Improving my self-hosted scrobbling implementation
description: I wrote (fairly) recently about implementing my own scrobbler using Plex webhooks, edge functions and blob storage. So far — so far — this has worked quite well.
tags:
  - music
  - plex
  - tech
  - supabase
  - musicbrainz
  - eleventy
---
[I wrote (fairly) recently about implementing my own scrobbler using Plex webhooks, edge functions and blob storage.](https://coryd.dev/posts/2024/building-a-scrobbler-using-plex-webhooks-edge-functions-and-blob-storage/) So far — so far — this has worked quite well.<!-- excerpt -->

In doing this, I was keeping listens as JSON blobs with Netlify, stored under keys for the week they belonged to.

Artist and album metadata lived in similar blob structures. What I found, however, was that this — especially the metadata — quickly became unwieldy. Chalk this up to my inclination to force what I knew to work instead of picking a better tool.

In the interest of making something I've enjoyed building and using more durable, I started looking at flexible database solutions. I poked around, asked some friends and landed on [Supabase](https://supabase.com):

> Supabase is an open source Firebase alternative.  
Start your project with a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, Storage, and Vector embeddings.

Sounds good, right? (Very much so, learning curve aside.)

I set up three tables: listens, albums and artists.

I had data for each, structured as JSON. I wrote some ugly node scripts (I'll spare you the pain of seeing those here) that wrote these out to CSVs.

I imported those CSVs into their respective tables, and worked my way to connections between the tables that look like this:

<img
  srcset="
    https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/supabase-schema.png&fit=cover&w=250&h=221&fm=webp&q=50 250w,
    https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/supabase-schema.png&fit=cover&w=500&h=443&fm=webp&q=50 500w,
    https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/supabase-schema.png&fit=cover&w=1000&h=886&fm=webp&q=50 1000w,
    https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/supabase-schema.png&fit=cover&w=2000&h=1772&fm=webp&q=50 2000w
  "
  sizes="(max-width: 450px) 250px,
    (max-width: 850px) 500px,
    (max-width: 1000px) 1000px,
    2000px"
  src="https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/supabase-schema.png&fit=cover&w=2000&h=1772&fm=webp&q=50"
  alt="A diagram of my scrobbling tables"
  class="image-banner"
  loading="eager"
  decoding="async"
  width="1000"
  height="886"
/>

The connections between the tables allow me to query data specific to a given listen's artist or album — data is stored in a given table where it makes the most sense: artist `mbid`s with artists, `genre`s with artists and so forth. I can then retrieve that data, provided I have a valid listen, using Supabase's select syntax: `artists (mbid, image)` or `albums (mbid, image)`.

Plex's webhooks send out a fair bit of data, but most of that data is Plex-specific. What I'm able to use from that payload is the artist, album and track names. These are stored in the listens table with a timestamp derived when I receive a webhook payload containing a `media.scrobble` event. These webhooks are sent to a `scrobble` endpoint (read: edge function:

```javascript
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = Netlify.env.get('SUPABASE_URL')
const SUPABASE_KEY = Netlify.env.get('SUPABASE_KEY')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const sanitizeMediaString = (string) => string.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')

export default async (request) => {
  const ACCOUNT_ID_PLEX = process.env.ACCOUNT_ID_PLEX
  const params = new URL(request.url).searchParams
  const id = params.get('id')

  if (!id) return new Response(JSON.stringify({ status: 'Bad request' }), { headers: { "Content-Type": "application/json" } })
  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({ status: 'Forbidden' }), { headers: { "Content-Type": "application/json" } })

  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))

  if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const listenedAt = Math.floor(DateTime.now().toSeconds())
    const artistKey = sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()
    const albumKey = `${artistKey}-${sanitizeMediaString(album).replace(/\s+/g, '-').toLowerCase()}`

    const { data: albumData, error: albumError } = await supabase
      .from('albums')
      .select('*')
      .eq('key', albumKey)
      .single()

    if (albumError && albumError.code === 'PGRST116') {
      const { error: insertAlbumError } = await supabase.from('albums').insert([
        {
          mbid: null,
          image: `https://coryd.dev/media/albums/${albumKey}.jpg`,
          key: albumKey,
          name: album,
          tentative: true
        }
      ])

      if (insertAlbumError) {
        console.error('Error inserting album into Supabase:', insertAlbumError.message)
        return new Response(JSON.stringify({ status: 'error', message: insertAlbumError.message }), { headers: { "Content-Type": "application/json" } })
      }
    } else if (albumError) {
      console.error('Error querying album from Supabase:', albumError.message)
      return new Response(JSON.stringify({ status: 'error', message: albumError.message }), { headers: { "Content-Type": "application/json" } })
    }

    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('name_key', artistKey)
      .single()

    if (artistError && artistError.code === 'PGRST116') {
      const { error: insertArtistError } = await supabase.from('artists').insert([
        {
          mbid: null,
          image: `https://coryd.dev/media/artists/${artistKey}.jpg`,
          key: albumKey,
          name: album,
          tentative: true
        }
      ])

      if (insertArtistError) {
        console.error('Error inserting artist into Supabase:', insertArtistError.message)
        return new Response(JSON.stringify({ status: 'error', message: insertArtistError.message }), { headers: { "Content-Type": "application/json" } })
      }
    } else if (artistError) {
      console.error('Error querying artist from Supabase:', artistError.message)
      return new Response(JSON.stringify({ status: 'error', message: artistError.message }), { headers: { "Content-Type": "application/json" } })
    }

    const { error: listenError } = await supabase.from('listens').insert([
      {
        artist_name: artist,
        album_name: album,
        track_name: track,
        listened_at: listenedAt,
        album_key: albumKey
      }
    ])

    if (listenError) {
      console.error('Error inserting data into Supabase:', listenError.message)
      console.log('Track with the error:', {
        artist_name: artist,
        album_name: album,
        track_name: track,
        listened_at: listenedAt,
        album_key: albumKey
      })
      return new Response(JSON.stringify({ status: 'error', message: listenError.message }), { headers: { "Content-Type": "application/json" } })
    }
  }

  return new Response(JSON.stringify({ status: 'success' }), { headers: { "Content-Type": "application/json" } })
}

export const config = {
  path: '/api/scrobble',
}
```

Scary! (Not really). This does a whole host of things:
1. Creates a `supabase` SDK client with my database url and API key.
2. Defines a `sanitizeMediaString` helper that does its best to normalize media strings.
3. Restricts access to requests with my Plex account ID and rejects invalid requests.
4. It then retrieves the data we're interested in from the webhook payload.
5. Next, in the interest of being cautious, we look to see if our `albumKey` is in the albums table. If it's not, we add a record for the album with the `boolean` `tenative` value set to true.
  1. This allows me to quickly identify records that were added programmatically and tidy them up if need be.
  2. If we can't add a record for the album, we error out as we don't have an album to attribute the listen to.
6. Rinse and repeat for artists (tracks need artists!).
7. Finally, we record the listen — if there's an error we log out which track caused the error.

Whew! On to the big scary (not!) presentation part:

```javascript
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchDataForPeriod = async (startPeriod, fields, table) => {
  const PAGE_SIZE = 1000
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .order('listened_at', { ascending: false })
      .gte('listened_at', startPeriod.toSeconds())
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

    rows = rows.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return rows
}

const aggregateData = (data, groupByField, groupByType) => {
  const aggregation = {}
  data.forEach(item => {
    const key = item[groupByField]
    if (!aggregation[key]) {
      if (groupByType === 'track') {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item['albums']?.mbid || '',
          url: item['albums']?.mbid ? `https://musicbrainz.org/release/${item['albums'].mbid}` : `https://musicbrainz.org/search?query=${encodeURIComponent(item['album_name'])}&type=release`,
          image: item['albums']?.image || '',
          timestamp: item['listened_at'],
          type: groupByType
        }
      } else {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item[groupByType]?.mbid || '',
          url: item[groupByType]?.mbid ? `https://musicbrainz.org/${groupByType === 'albums' ? 'release' : 'artist'}/${item[groupByType].mbid}` : `https://musicbrainz.org/search?query=${encodeURIComponent(item[groupByField])}&type=${groupByType === 'albums' ? 'release' : 'artist'}`,
          image: item[groupByType]?.image || '',
          type: groupByType
        }
      }
      if (
        groupByType === 'track' ||
        groupByType === 'albums'
      ) aggregation[key]['artist'] = item['artist_name']
    }
    aggregation[key].plays++
  })
  return Object.values(aggregation).sort((a, b) => b.plays - a.plays)
}


export default async function() {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'), // Last week
    month: DateTime.now().minus({ days: 30 }).startOf('day'), // Last 30 days
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day'), // Last three months
    year: DateTime.now().minus({ years: 1 }).startOf('day'), // Last 365 days
  }

  const results = {}
  const selectFields = `
    track_name,
    artist_name,
    album_name,
    album_key,
    listened_at,
    artists (mbid, image),
    albums (mbid, image)
  `

  for (const [period, startPeriod] of Object.entries(periods)) {
    const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'listens')
    results[period] = {
      artists: aggregateData(periodData, 'artist_name', 'artists'),
      albums: aggregateData(periodData, 'album_name', 'albums'),
      tracks: aggregateData(periodData, 'track_name', 'track')
    }
  }

  const recentData = await fetchDataForPeriod(DateTime.now().minus({ days: 7 }), selectFields, 'listens')

  results.recent = {
    artists: aggregateData(recentData, 'artist_name', 'artists'),
    albums: aggregateData(recentData, 'album_name', 'albums'),
    tracks: aggregateData(recentData, 'track_name', 'track')
  }

  results.nowPlaying = results.recent.tracks[0]

  return results
}
```

1. We set up another `supabase` SDK client with my database url and API key.
2. We author a method that will fetch data for different time periods (cleverly named `fetchDataForPeriod`). We pass in a start period, it pages through results from our `listens` table until we're out and filters out anything with a `listend_at` timestamp greater than or equal to our `startPeriod` in seconds.
3. This all yields data that we store in `periodData` — which is called within a for loop where we pull data for each of our time periods defined in `const periods = ...`.
  1. Within this loop we populate our `results` object. It has a key for each period we're concerned with populating and that key is populated with aggregated `artists`, `albums` and `tracks` data from our `aggregateData` function (clever naming again, right?).
  2. This `aggregateData` function takes our raw data, a field to group by that corresponds to the name of the pertinent column in Supabase and a type.
    1. If we're populating track objects, we define one shape, if we're dealing with albums or artists, we modify the shape a bit.
    2. If an object is either a track or an album, we add the artist name to the object.
    3. If an object has already been built, we increment the play count and go on our merry way.
4. I guess that's a lot — or a bit, I dunno. JSON to CSVs to tables, wire the tables together, write to the table, query things and present it.

This also required that I update my `now-playing` endpoint/edge function that displays the last played track on my home page. The relevant section of that file is here:

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

...

export default async () => {
  const { data, error } = await supabase
    .from('listens')
    .select(`
      track_name,
      artist_name,
      listened_at,
      artists (mbid, genre)
    `)
    .order('listened_at', { ascending: false })
    .range(0, 1)

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=360, stale-while-revalidate=1080",
  };

  if (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: "Failed to fetch the latest track" }), { headers });
  }

  if (data.length === 0) {
    return new Response(JSON.stringify({ message: "No recent tracks found" }), { headers });
  }

  const scrobbleData = data[0]

  return new Response(JSON.stringify({
    content: `${emojiMap(
      scrobbleData.artists.genre,
      scrobbleData.artist_name
    )} ${scrobbleData.track_name} by <a href="http://musicbrainz.org/artist/${scrobbleData.artists.mbid}">${
      scrobbleData.artist_name
    }</a>`,
  }), { headers });
};
```

1. You guessed it! We set up a `supabase` SDK client.
2. We query our listens table and grab our `mbid` and `genre` via our foreign key connection to the artists table.
3. In much the same way as we did before, we pass the artist `genre` and `name` through our absurd `emojiMap` function and send back HTML to display.

[All of the music data used to present artist and album grids and track charts on my site](https://coryd.dev/now) is now retrieved from Supabase on each build. It's much easier to add, modify or deal with artist and album metadata (and even update listen data if needed).