---
date: '2023-06-21'
title: 'Displaying listening data from Apple Music using MusicKit.js'
draft: false
tags: ['development', 'music', 'Eleventy', 'Apple', 'JavaScript']
image: https://cdn.coryd.dev/blog/albums-artists.jpg
---

Up until now my [now](https://coryd.dev/now) page has sourced music data from Last.fm (and may well again). But, in the interest in experimenting a bit, I've tried my hand at rewriting that part of the page to leverage data from Apple Music, using [MusicKit.js](https://developer.apple.com/documentation/musickitjs) instead.<!-- excerpt -->

This implementation gets me away from needing a separate app installed to send my plays to Last.fm[^1]. It should be noted that this approach **does not** track or store your listening history. Depending on your attitude towards personal data collection this may be a feature or a deal-breaker.

With that said, let's get into it.

First, register a developer account with Apple (you'll need this to obtain the necessary api access). The exceedingly talented [Lee Martin](https://www.linkedin.com/in/leepaulmartin/) has [an excellent write-up on creating an Apple Music token that I referenced to obtain mine](https://leemartin.dev/creating-an-apple-music-api-token-e0e5067e4281). You'll need a Team Id, Private Key and Key Id. Follow Lee's instructions, [copy his script](https://gist.githubusercontent.com/leemartin/0dac81a74a58f8587270dca9089ddb7f/raw/8378ff9afe9ed841120c774813f81bd7fdf387fe/musickit-token-encoder.js)[^2]. Run `yarn add jsonwebtoken` and `node index.js`. Save the token that it writes to the buffer.

Second, we need a `music-user-token` to send in our request headers. This is obtained by authenticating with Apple Music (and lasts for about 6 months). We'll obtain this token using the following markup:

```html
<html>
<script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
<script>
  document.addEventListener('musickitloaded', function () {
    MusicKit.configure({
      developerToken: '<REMEMBER THE TOKEN FROM STEP 1?>',
      app: {
        name: 'name',
        build: '1'
      }
    });
    const music = MusicKit.getInstance();
    music.authorize().then(function (response) {
      console.log(response);
    });
  });
</script>
</html>
```

Open this page in your browser, keep an eye on your console for the page and the popup that opens and `grep` around to find your `music-user-token` in the output. Save it.

Third (next?), we need to call the Apple Music endpoint and get our data. I'm doing this in Eleventy and the code looks like this:

```javascript
const { AssetCache } = require('@11ty/eleventy-fetch')

const sortTrim = (array, length = 8) =>
  Object.values(array)
    .sort((a, b) => b.plays - a.plays)
    .splice(0, length)

module.exports = async function () {
  const APPLE_BEARER = process.env.API_BEARER_APPLE_MUSIC
  const APPLE_TOKEN = process.env.API_TOKEN_APPLE_MUSIC
  const asset = new AssetCache('recent_tracks_data')
  const PAGE_SIZE = 30
  const PAGES = 8
  const response = {
    artists: {},
    albums: {},
    tracks: {},
  }

  let CURRENT_PAGE = 0
  let res = []

  if (asset.isCacheValid('1h')) return await asset.getCachedValue()

  while (CURRENT_PAGE < PAGES) {
    const URL = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=${PAGE_SIZE}&offset=${
      PAGE_SIZE * CURRENT_PAGE
    }`
    const tracks = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPLE_BEARER}`,
        'music-user-token': `${APPLE_TOKEN}`,
      },
    })
      .then((data) => data.json())
      .catch()
    res = [...res, ...tracks.data]
    CURRENT_PAGE++
  }

  res.forEach((track) => {
    // aggregate artists
    if (!response.artists[track.attributes.artistName]) {
      response.artists[track.attributes.artistName] = {
        name: track.attributes.artistName,
        plays: 1,
      }
    } else {
      response.artists[track.attributes.artistName].plays++
    }

    // aggregate albums
    if (!response.albums[track.attributes.albumName]) {
      response.albums[track.attributes.albumName] = {
        name: track.attributes.albumName,
        artist: track.attributes.artistName,
        art: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
        plays: 1,
      }
    } else {
      response.albums[track.attributes.albumName].plays++
    }

    // aggregate tracks
    if (!response.tracks[track.attributes.name]) {
      response.tracks[track.attributes.name] = {
        name: track.attributes.name,
        plays: 1,
      }
    } else {
      response.tracks[track.attributes.name].plays++
    }
  })
  response.artists = sortTrim(response.artists)
  response.albums = sortTrim(response.albums)
  response.tracks = sortTrim(response.tracks, 5)
  await asset.save(response, 'json')
  return response
}
```

We start by defining `sortTrim` as a helper function that takes an array of objects, sorts them in descending order by play count and trims the resulting array to the default length. We'll use this later.

Next, we define a range of constants — the tokens we obtained earlier — and fixed page size values. Apple's `/recent/played/` endpoint returns no more than `30` tracks at a time, so we'll be calling it iteratively.

Within the `while` statement we'll construct our endpoint url complete with parameters (changing the `limit` and `offset`) with each iteration and aggregate the data in the `res` array. Once we have an array of track data populated (in this case, `8 * 30 = 240` tracks), we'll aggregate some vaguely meaningful data in our `response` object.

For each track we'll populate `artist`, `album` and `track` data — for artists and tracks we simply want a name and a play count, for albums we also want to populate an `art` property with an url. Apple's api returns this url as a string with `{h}` and `{w}` tokens to be replaced (300x300 is sufficient for my purposes). Once we've aggregated this data, we cache it using the `AssetCache` from `@eleventy/fetch`.

As an example, the `artists` property in the output should look like this:

```json
artists: [
  { name: 'Deiquisitor', plays: 27 },
  { name: 'Prince Daddy & the Hyena', plays: 26 },
  { name: 'Oranssi Pazuzu', plays: 19 },
  { name: 'Joyce Manor', plays: 18 },
  { name: 'Nucleus', plays: 17 },
  { name: 'Drug Church', plays: 17 },
  { name: 'Sunken', plays: 12 },
  { name: 'Home Is Where', plays: 10 }
],
```

The templating for my site is all written in [liquid.js](https://liquidjs.com) and looks like the following:
{% raw %}
```liquid
{% if recentTracks.size > 0 %}
  <h2 class="m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    {% heroicon "outline" "microphone" "Artists" "height=28" %}
    <div class="ml-1">Artists</div>
  </h2>
  <div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
    {% for artist in recentTracks.artists %}
      <a href="https://rateyourmusic.com/search?searchterm={{ artist.name | escape }}" title="{{artist.name | escape}}">
        <div class="relative block">
          <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-600 hover:border-purple-500 bg-cover-gradient dark:border-purple-400 dark:hover:border-purple-500"></div>
          <div class="absolute left-1 bottom-2 drop-shadow-md">
            <div class="px-1 text-xs font-bold text-white">{{ artist.name }}</div>
            <div class="px-1 text-xs text-white">
              {{ artist.plays }} plays
            </div>
          </div>
          {%- capture artistImg %}{{ artist.name | artist }}{% endcapture -%}
          {%- capture artistName %}{{ artist.name | escape }}{% endcapture -%}
          {% image artistImg, artistName, 'rounded-lg', '225px', 'eager' %}
        </div>
      </a>
    {% endfor %}
  </div>
{% endif %}
{% if recentTracks.size > 0 %}
  <h2 class="m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    {% heroicon "outline" "musical-note" "Albums" "height=28" %}
    <div class="ml-1">Albums</div>
  </h2>
  <div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
    {% for album in recentTracks.albums %}
      <a href="https://rateyourmusic.com/search?searchtype=l&searchterm={{album.name | escape}}" title="{{album.name | escape}}">
        <div class="relative block">
          <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-600 hover:border-purple-500 bg-cover-gradient dark:border-purple-400 dark:hover:border-purple-500"></div>
          <div class="absolute left-1 bottom-2 drop-shadow-md">
            <div class="px-1 text-xs font-bold text-white">{{ album.name }}</div>
            <div class="px-1 text-xs text-white">
              {{ album.artist }}
            </div>
          </div>
          {%- capture albumName %}{{ album.name | escape }}{% endcapture -%}
          {% image album.art, albumName, 'rounded-lg', '225px' %}
        </div>
      </a>
    {% endfor %}
  </div>
{% endif %}
```
{% endraw %}

We have an object containing arrays of objects — we iterate through each object for the appropriate section (tracks aren't displayed at the moment) and build the resulting display[^3]. This isn't perfect by any means, but, it does provide a nice little visualization of what I'm listening to and `240` tracks feels adequate as a rolling window into that activity.

{% image 'https://cdn.coryd.dev/blog/albums-artists.jpg', 'Albums and artists', 'w-full', '600px' %}

[^1]: There are some good options to do this, but there aren't a _ton_ and the age of some of the apps is concerning. [Marvis](https://appaddy.wixsite.com/marvis) is far and away your best choice here.
[^2]: Making sure that you update the values you obtained, including the path to your downloaded `.p8` file.
[^3]: I'm linking each artist or album out to [Rate Your Music](https://rateyourmusic.com) as it's not platform specific and due to the fact that Apple's api doesn't return valid links for library tracks that I've imported into their service.