---
date: '2023-07-21'
title: 'Road to madness: charting Apple Music listening data'
draft: false
tags: ['development', 'music', 'Eleventy', 'Apple', 'JavaScript', 'API']
image: https://cdn.coryd.dev/blog/charlie.jpg
---

I've written before about [displaying my listening data from Apple Music](https://coryd.dev/posts/2023/displaying-listening-data-from-apple-music-using-musickit/) but, recently, I've attempted to take things a bit further.<!-- excerpt -->

The Apple Music is API is cool because it gives you data about your music, it's not cool because well, it's missing some things. It sends back a whole host of handy-dandy track metadata that you'd expect from a music service and that's great. But it doesn't provide data you'd normally expect like, well, a time stamp of when the recently played track was recently played.

I want an API that can act as a state of truth — what I've got is an API that returns tracks in the play order, but with no concrete representation of when they were actually played.

Where does that leave us? Well, if we're smart, that solution might look like what I ran with during my first go around. I call Apple's API and iteratively page through it to aggregate a 200 track sample. That's about 6-7 calls and a moving window.

What we can achieve though, dear listener, through some inferences and external storage is a cache and — wait for it — with a more slowly moving, less capricious window.

What we've got:

- The current time
- A duration for each track

What we can do:

- Calculate how many tracks from Apple's response approximate an hour of listening
- Infer time stamps by moving backwards iteratively through an hour of listening

This isn't canonical, it's not definitive, but it's what we've got.

So, we're dealing with JSON and a static site generator. We want to persist our data as a cache, read it in and write out an update. For this I've elected to use Wasabi, who offer a 1:1 compatible S3 API. The data structure we want to store for each track looks like this[^1]:

```json
{
  "i.rXXXdmUa6Nme-1689970612847": {
    // that's an id + a timestamp, not a leaked key
    "name": "Sacrificial Blood Oath In The Temple Of K'zadu",
    "artist": "Gateway",
    "album": "Galgendood",
    "art": "https://store-033.blobstore.apple.com/sq-mq-us-033-000002/18/f1/a3/18f1a37a-8c9a-169a-5458-464aea20ce05/image?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230721T202228Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=MKIAU0HKO2RBEAT0UMZS%2F20230721%2Fstore-033%2Fs3%2Faws4_request&X-Amz-Signature=85790600221880597074559ed3674564f17ca3df6634d6fa15496baf7aca5d56",
    "url": "https://rateyourmusic.com/search?searchtype=l&searchterm=Galgendood%20Gateway",
    "id": "i.rXXXdmUa6Nme",
    "playTime": 1689970612847,
    "duration": 338808
  }
}
```

When I deploy a production build of my site[^2] we'll read in our cache from Wasabi, call Apple's flawed[^3] but persistent API, align the two and suss out the difference:

```javascript
const _ = require('lodash')

const getTracksOneHour = (tracks) => {
  const TIMER_CEILING = 3600000 // 1 hour
  const tracksOneHour = []
  let trackIndex = 0
  let trackTimer = 0

  while (trackTimer < TIMER_CEILING) {
    if (!tracks[trackIndex]) return tracksOneHour
    trackTimer = trackTimer + parseInt(tracks[trackIndex].duration)
    tracksOneHour.push(tracks[trackIndex])
    trackIndex++
  }

  return tracksOneHour
}

const diffTracks = (cache, tracks) => {
  const trackCompareSet = Object.values(tracks)
  const cacheCompareSet = _.orderBy(Object.values(cache), ['time'], ['desc'])
  const diffedTracks = {}
  const cacheCompareOneHour = getTracksOneHour(cacheCompareSet)
  const comparedTracks = _.differenceWith(trackCompareSet, cacheCompareOneHour, (a, b) =>
    _.isEqual(a.id, b.id)
  )

  for (let i = 0; i < comparedTracks.length; i++)
    diffedTracks[`${comparedTracks[i]?.id}-${comparedTracks[i].playTime}`] = comparedTracks[i]

  return diffedTracks
}
```

Still with me? Next — we're going to derive some chart data, excluding anything not within a week prior to build time (this is where that slower moving window comes in).

```javascript
const deriveCharts = (tracks) => {
  const charts = {
    artists: {},
    albums: {},
  }
  const tracksForLastWeek = Object.values(tracks).filter((track) => {
    const currentDate = new Date()
    const currentDateTime = new Date().getTime()
    const lastWeek = new Date(currentDate.setDate(currentDate.getDate() - 7))
    const lastWeekDateTime = lastWeek.getTime()
    const trackDateTime = new Date(track.playTime).getTime()
    return trackDateTime <= currentDateTime && trackDateTime > lastWeekDateTime
  })

  tracksForLastWeek.forEach((track) => {
    if (!charts.artists[track.artist]) {
      charts.artists[track.artist] = {
        artist: track.artist,
        genre: getKeyByValue(artistGenres, track.artist.replace(/\s+/g, '-').toLowerCase()),
        url: `https://rateyourmusic.com/search?searchterm=${encodeURI(track.artist)}`,
        plays: 1,
      }
    } else {
      charts.artists[track.artist].plays++
    }

    if (!charts.albums[track.album]) {
      charts.albums[track.album] = {
        name: track.album,
        artist: track.artist,
        art: track.art,
        url: track.url,
        plays: 1,
      }
    } else {
      charts.albums[track.album].plays++
    }
  })

  return charts
}
```

_Cool_[^4]. GitHub triggers a rebuild of the site every hour, Netlify builds it, Eleventy optimizes images that are stored at bunny.net, Apple provides the listening data, Wasabi provides persistence.

There are some significant issues with this approach: it doesn't capture listens to an album in a loop (like me playing the new Outer Heaven record today — hails 🤘). It can get wonky when my diff function hits a track order that elicits a false positive return value.

{% image 'https://cdn.coryd.dev/blog/charlie.jpg', 'Charlie Day standing in front of charts', 'border border-purple-600 dark:border-purple-400 rounded-lg overflow-hidden [&>*]:w-full' %}

"But Cory there's last.fm." I hear this, I love last.fm, but I've got concerns about its age, ownership and maintenance. I don't want to be on the wrong end of a scream test when the wrong (right?) server rack gets decommissioned.

So, would I recommend pursuing this? Probably not, pretty definitely, probably not. It's, I think, as close as it can be to being an accurate but imperfect representation of what I listen to regularly. With that imperfect accuracy in mind I've replaced play counts on [my now page](https://coryd.dev/now) where this is all displayed with the genres I've associated with each artist[^5]. I _like_ where this is at. I'd **love** it if Apple would take away my crazy wall and give me a timestamp though.

[^1]: Yes this is a real song — see [Death Metal English (2013)](https://www.invisibleoranges.com/death-metal-english/)
[^2]: A technical term — by no means a measure of importance over here.
[^3]: A statement of fact, not a pejorative descriptor.
[^4]: Said as witheringly as John Oliver can muster.
[^5]: As exported from Music.app and programmatically transformed into JSON, naturally — feel free to email me and argue my choices. Are Runemagick slow enough to warrant being tagged as death doom metal rather than death metal? Is the granularity more valuable than broad, bucketed categories? Is the vocalist's delivery more black than death metal? The world may never know.
