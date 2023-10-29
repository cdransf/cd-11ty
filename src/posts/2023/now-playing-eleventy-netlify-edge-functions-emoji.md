---
date: '2023-08-25'
title: 'Displaying now playing data with matching emoji using Netlify edge functions and Eleventy'
draft: false
tags: ['Eleventy', 'JavaScript']
---

My site is built using [11ty](https://www.11ty.dev) and is rebuilt once an hour. These frequent rebuilds accomplish a few things, notably updating webmention data and keeping [my now page](https://coryd.dev/now/) current. Recently, however, I decided to add the track I'm other currently listening to on my home page which, ideally, would be updated in real time. [Enter client-side JavaScript and Netlify's Edge Functions](https://docs.netlify.com/edge-functions/overview/).<!-- excerpt -->

The function I've written works by making a pair of API calls: one to Last.fm which returns an `mbid` (MusicBrainz ID) and another directly to MusicBrainz to retrieve genre data. It looks like this:

```javascript
export default async () => {
  // access our Last.fm API key and interpolate it into a call to their recent tracks endpoint
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM')
  const trackUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=cdrn_&api_key=${MUSIC_KEY}&limit=1&format=json`
  // fetch the track data
  const trackRes = await fetch(trackUrl, {
    type: 'json',
  }).catch()
  const trackData = await trackRes.json()
  // extract the `mbid`
  const track = trackData['recenttracks']['track'][0]
  const mbid = track['artist']['mbid']
  let genre = ''

  // IF we get a valid mbid make the call to MusicBrainz
  if (mbid && mbid !== '') {
    const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`
    const genreRes = await fetch(genreUrl, {
      type: 'json',
    }).catch()
    const genreData = await genreRes.json()
    genre = genreData.genres.sort((a, b) => b.count - a.count)[0]['name']
  }

  // return our required data
  return Response.json({
    artist: track['artist']['#text'],
    title: track['name'],
    genre,
    emoji: emojiMap(genre, track['artist']['#text']),
  })
}

export const config = { path: '/api/now-playing' }
```

In the past I've displayed a single emoji with the current track but, in the interest of injecting some — let's say — whimsy into this whole exercise, I'm taking the genre from MusicBrainz and attempting to match it to an appropriate emoji:

```javascript
const emojiMap = (genre, artist) => {
  const DEFAULT = '🎧'
  if (!genre) return DEFAULT // early return for bad input
  if (artist === 'David Bowie') return '👨🏻‍🎤'
  if (artist === 'Minor Threat') return '👨🏻‍🦲'
  if (genre.includes('death metal')) return '💀'
  if (genre.includes('black metal')) return '🪦'
  if (genre.includes('metal')) return '🤘'
  if (genre.includes('emo') || genre.includes('blues')) return '😢'
  if (genre.includes('grind') || genre.includes('powerviolence')) return '🫨'
  if (
    genre.includes('country') ||
    genre.includes('americana') ||
    genre.includes('bluegrass') ||
    genre.includes('folk')
  )
    return '🪕'
  if (genre.includes('post-punk')) return '😔'
  if (genre.includes('dance-punk')) return '🪩'
  if (genre.includes('punk') || genre.includes('hardcore')) return '✊'
  if (genre.includes('hip hop')) return '🎤'
  if (genre.includes('progressive') || genre.includes('experimental')) return '🤓'
  if (genre.includes('jazz')) return '🎺'
  if (genre.includes('psychedelic')) return '💊'
  if (genre.includes('dance') || genre.includes('electronic')) return '💻'
  if (
    genre.includes('alternative') ||
    genre.includes('rock') ||
    genre.includes('shoegaze') ||
    genre.includes('screamo')
  )
    return '🎸'
  return DEFAULT
}
```

This could all be done with an object with the genre names assigned to keys but given how nebulous genres can be I've instead settled for a range of conditions checking for substring matches[^1].

More precise genre names get checked earlier in the function, with less precise matches taking place after (e.g. `post-punk` and `dance-punk` are evaluated before matches to `punk` alone) and then defaulting to the headphones emoji if a match isn't found or an empty string is passed in for the genre.

The client side JavaScript to display the retrieve data is pretty straightforward:

```javascript
;(async function () {
  // cache DOM selectors
  const nowPlaying = document.getElementById('now-playing')
  if (nowPlaying) {
    const emoji = document.getElementById('now-playing-emoji')
    const content = document.getElementById('now-playing-content')
    const loading = document.getElementById('now-playing-loading')
    const populateNowPlaying = (data) => {
      loading.style.display = 'none'
      emoji.innerText = data.emoji
      content.innerText = `${data.title} by ${data.artist}`
      emoji.classList.remove('hidden')
      content.classList.remove('hidden')
    }

    // try and retrieve cached track data
    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) populateNowPlaying(cache)
    } catch (e) {
      /* quiet catch */
    }

    // fetch now playing data from our edge function
    const res = await fetch('/api/now-playing', {
      type: 'json',
    }).catch()
    const data = await res.json()

    // cache retrieved data
    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {
      /* quiet catch */
    }

    if (!JSON.parse(localStorage.getItem('now-playing')) && !data) nowPlaying.remove()

    // update the DOM with the data we've retrieved from the edge function
    populateNowPlaying(data)
  }
})()
```

The template to be populated looks like the following:

{% raw %}

```liquid
<p id="now-playing" class="client-side mb-0 flex flex-row items-start md:items-center">
  <span id="now-playing-loading" class="icon--spin">
    {% tablericon 'loader-2' 'Loading...' %}
  </span>
  <span id="now-playing-display">
    <span id="now-playing-emoji" class="pt-1 md:pt-0 mr-1"></span>
    <span id="now-playing-content"></span>
  </span>
</p>
```

{% endraw %}

Finally, if the page this all lives on is loaded by a client without JavaScript enabled, it will be hidden by the `client-side` class which is simply:

```html
<noscript>
  <style>
    .client-side {
      display: none;
    }
  </style>
</noscript>
```

All of this, yields the single line at the bottom of this image — updated on each visit.

{% image '<https://cdn.coryd.dev/blog/now-playing.jpg>', 'Now playing', 'border border-blue-500 dark:border-blue-200 rounded-lg overflow-hidden [&>*]:w-full' %}

[^1]: Plus explicit conditions matching David Bowie and Minor Threat.
