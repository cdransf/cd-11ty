---
date: '2023-11-30'
title: 'Check in to your personal site'
description: "For a while now I've had a line on my homepage displaying the track I'm currently listening to via Last.fm. In the interest of taking things entirely too far I've expanded what it does a fair bit."
draft: false
tags: ['Eleventy', 'JavaScript', 'Last.fm', 'Trakt', 'NBA', 'API']
---
For a while now I've had a line on my homepage displaying the track I'm currently listening to via [Last.fm](https://www.last.fm/user/coryd_). In the interest of taking things entirely too far I've expanded what it does a fair bit.<!-- excerpt -->

The display functionality is powered by a Netlify edge function that looks like this:

```javascript
const emojiMap = (genre, artist) => {
  const DEFAULT = '🎧'
  if (artist === 'Autopsy') return '🧟'
  if (artist === 'Bruce Springsteen') return '🇺🇸'
  if (artist === 'David Bowie') return '👨🏻‍🎤'
  if (artist === 'Imperial Triumphant') return '🎭'
  if (artist === 'Minor Threat') return '👨🏻‍🦲'
  if (artist === 'Panopticon') return '🪕🪦'
  if (artist === 'Taylor Swift') return '👸🏼'

  // mbid mismatches
  if (artist === 'AFI') return '✊'
  if (artist === 'Cruciamentum') return '💀'
  if (artist === 'Edge of Sanity') return '💀'
  if (artist === 'Fumes') return '💀'
  if (artist === 'Ghastly') return '💀'
  if (artist === 'Osees') return '💊'
  if (artist === 'Pigment Vehicle') return '✊'
  if (artist === 'Worm') return '💀'

  // early return for bad input
  if (!genre) return DEFAULT

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

export default async () => {
  const TV_KEY = Netlify.env.get('API_KEY_TRAKT')
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM')

  const traktRes = await fetch('https://api.trakt.tv/users/cdransf/watching', {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': 2,
      'trakt-api-key': TV_KEY,
    },
  })
    .then((data) => {
      if (data.body) return data.json()
      return {}
    })
    .catch()

  if (Object.keys(traktRes).length) {
    if (traktRes['type'] === 'episode') {
      return Response.json({
        content: `📺 <a href="https://trakt.tv/shows/${traktRes['show']['ids']['slug']}">${traktRes['show']['title']}</a> • <a href="https://trakt.tv/shows/${traktRes['show']['ids']['slug']}/seasons/${traktRes['episode']['season']}/episodes/${traktRes['episode']['number']}">${traktRes['episode']['title']}</a>`,
      })
    }

    if (traktRes['type'] === 'movie') {
      return Response.json({
        content: `🎥 <a href="https://trakt.tv/movies/${traktRes['movie']['ids']['slug']}">${traktRes['movie']['title']}</a>`,
      })
    }
  }

  const nbaRes = await fetch(
    'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'
  )
    .then((data) => data.json())
    .catch()
  const games = nbaRes?.scoreboard?.games

  if (games && games.length) {
    const isAmPm = (hours) => (hours >= 12 ? 'pm' : 'am')
    const game = games.find((game) => game.gameCode.includes('LAL'))
    if (game) {
      const startDate = new Date(game.gameTimeUTC)
      const startTime = startDate.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      })
      const endDate = startDate.setHours(startDate.getHours() + 3)
      const endTime = new Date(endDate).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      })
      const nowDate = new Date()
      const now = nowDate.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      })
      const isCorrectDate =
        now.split(',')[0] === startTime.split(',')[0] &&
        now.split(',')[0] === endTime.split(',')[0] &&
        isAmPm(startDate.getHours()) === isAmPm(nowDate.getHours())
      const nowHour = parseInt(now.split(',')[1].split(':')[0].trim())
      const startHour = parseInt(startTime.split(',')[1].split(':')[0].trim())
      const endHour = parseInt(endTime.split(',')[1].split(':')[0].trim())
      const nowMinutes = parseInt(now.split(',')[1].split(':')[1].trim())
      const startMinutes = parseInt(startTime.split(',')[1].split(':')[1].trim())
      const endMinutes = parseInt(endTime.split(',')[1].split(':')[1].trim())
      const res = {
        content: `🏀 ${game['awayTeam']['teamName']} (${game['awayTeam']['wins']}-${game['awayTeam']['losses']}) @ ${game['homeTeam']['teamName']} (${game['homeTeam']['wins']}-${game['homeTeam']['losses']})`,
      }

      if (isCorrectDate) {
        if (nowHour === startHour && nowMinutes >= startMinutes && nowHour < endHour)
          return Response.json(res)
        if (nowHour > startHour && nowHour < endHour) return Response.json(res)
        if (nowHour > startHour && nowMinutes <= endMinutes && nowHour == endHour)
          return Response.json(res)
      }
    }
  }

  const trackUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=coryd_&api_key=${MUSIC_KEY}&limit=1&format=json`
  const trackRes = await fetch(trackUrl, {
    type: 'json',
  }).catch()
  const trackData = await trackRes.json()
  const track = trackData['recenttracks']['track'][0]
  const mbid = track['artist']['mbid']
  let genre = ''
  const artistUrl = mbid
    ? `https://musicbrainz.org/artist/${mbid}`
    : `https://musicbrainz.org/search?query=${track['artist']['#text'].replace(
        /\s+/g,
        '+'
      )}&type=artist`

  if (mbid && mbid !== '') {
    const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`
    const genreRes = await fetch(genreUrl, {
      type: 'json',
    }).catch()
    const genreData = await genreRes.json()
    genre = genreData.genres.sort((a, b) => b.count - a.count)[0]?.['name'] || ''
  }

  return Response.json({
    content: `${emojiMap(genre, track['artist']['#text'])} <a href="${track['url']}">${
      track['name']
    }</a> by <a href="${artistUrl}">${track['artist']['#text']}</a>`,
  })
}

export const config = { path: '/api/now-playing' }
```

At the top of the file you'll find a messy helper function that maps emoji to the currently playing track when supplied with the artist fetched from [Last.fm](https://www.last.fm/user/coryd_) and the genre as supplied by MusicBrainz. [Last.fm](https://www.last.fm/user/coryd_) will, typically, return an `mbid` in its response which is a unique identifier mapped to an artist page over at MusicBrainz. This `mbid` can then be used to fetch the most upvoted genre for the artist on MusicBrainz[^1]. This is the most common display case.

If I happen to check in to a movie or TV show over at [Trakt](https://trakt.tv/users/cdransf), that will get fetched _before_ the [Last.fm](https://www.last.fm/user/coryd_) data, differentiate between the two media types to set the appropriate emoji and data display format and execute an early return, skipping all of the aforementioned music logic.

Next, and perhaps the most irritatingly involved part of this exercise, is parsing the NBA game schedule for the current day, searching the response for the [Lakers](https://lakers.com) and then displaying information about the game _only_ while it's taking place. This isn't an actively taken action but I either watch or follow every game and it seemed appropriate to include (if perhaps a bit ridiculous).

When this all runs, it returns a `JSON` object at `https://coryd.dev/api/now-playing`. The client side JavaScript looks like the following and simply fetches the data before caching the response in local storage and updating the DOM:

```javascript
;(async function () {
  const nowPlaying = document.getElementById('now-playing')

  if (nowPlaying) {
    const content = document.getElementById('now-playing-content')
    const loading = document.getElementById('now-playing-loading')

    const populateNowPlaying = (data) => {
      loading.style.display = 'none'
      content.innerHTML = data.content
      content.classList.remove('hidden')
    }

    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) populateNowPlaying(cache)
    } catch (e) {
      /* quiet catch */
    }

    const data = await fetch('/api/now-playing', {
      type: 'json',
    })
      .then((data) => data.json())
      .catch(() => {
        loading.style.display = 'none'
      })

    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {
      /* quiet catch */
    }

    if (!JSON.parse(localStorage.getItem('now-playing')) && !data) nowPlaying.remove()

    populateNowPlaying(data)
  }
})()
```

I can't think of much else in the way of statuses or check ins to include — I suppose what I have is likely, uh, enough? None of this is _necessary_, but here we are.

[^1]: This will sometimes fail since Last.fm has never split out different artists who share the same name, yielding an incorrect `mbid` or, in some cases, will not return one at all. Depending on the artist, I'll either patch the `mbid` by targeting their name in the `emojiMap` function or let it return the default emoji.
