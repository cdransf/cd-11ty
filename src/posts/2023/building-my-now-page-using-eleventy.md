---
date: '2023-03-18'
title: 'Building my /now page using Eleventy'
draft: false
tags: ['Eleventy', 'JavaScript', 'Last.fm', 'Oku', 'Trakt', 'Letterboxd']
---

As part of my commitment to writing about things I've written in other frameworks in Eleventy, this is how I re-engineered [my /now page](/now) in [Eleventy](https://www.11ty.dev/).<!-- excerpt -->[^1]

My /now page is a series of discreet sections — the **Currently** block is [populated by data from](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_includes/now.liquid#L14) [omg.lol](https://omg.lol)'s status.lol service and [several static bullet points and complimentary SVGs](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_includes/now.liquid#L14-L31). The data request to retrieve my status looks like the following:

```javascript
const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const url = 'https://api.omg.lol/address/cory/statuses/'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  })
  const status = await res
  return status.response.statuses[0]
}
```

The **Listening: artists** and **Listening: albums** sections draw on data from [Last.fm's API](https://www.last.fm/api). The artist request looks like this:

```javascript
const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=cdme_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  })
  const artists = await res
  return artists.topartists.artist
}
```

The **Listening: albums** call is quite similar, swapping the `user.gettopartists` method for `user.gettopalbums`. The liquid templating for artists iterates through the retrieved and cached data to populate the section:

{% raw %}

```liquid
{% if artists %}
    <h2
        class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4"
    >
        Listening: artists
    </h2>
    <div>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
            {% for artist in artists %}
                <a href="{{artist.url}}" title="{{artist.name | escape}}">
                    <div class="relative block">
                        <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-500 bg-cover-gradient dark:border-gray-500"></div>
                        <div class="absolute left-1 bottom-2 drop-shadow-md">
                            <div class="px-1 text-xs font-bold text-white">{{artist.name}}</div>
                            <div class="px-1 text-xs text-white">
                                {{artist.playcount}} plays
                            </div>
                        </div>
                        <img
                            src="{{artist.name | artist}}"
                            onerror="this.onerror=null; this.src='/assets/img/media/404.jpg'"
                            width="350"
                            height="350"
                            class="rounded-lg" alt="{{artist.name | escape}}"
                            loading="lazy"
                        />
                    </div>
                </a>
            {% endfor %}
        </div>
    </div>
{% endif %}
```

{% endraw %}

Artist images are populated by passing the `artist` object to [an `artist` filter](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/config/mediaFilters.js#L4-L5) which strips spaces, replacing them with `-` and normalizing the artist name string to lowercase:

```javascript
artist: (media) =>
        `https://cdn.coryd.dev/artists/${media.replace(/\s+/g, '-').toLowerCase()}.jpg`,
```

These images are all cropped to `350x350` and hosted over on <a href="https://bunny.net?ref=revw3mehej" onclick="va('event',{name:'Bunny.net referral',data:{location:'Blog post: Building my /now page using Eleventy'}})">Bunny.net</a>[^2].

[Much like artists, we populate albums from data sourced from Last.fm](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_data/albums.js)

{% raw %}

```liquid
{% if albums %}
    <h2
        class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4"
    >
        Listening: albums
    </h2>
    <div>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
            {% for album in albums %}
                <a href="{{album.url}}" title="{{album.name | escape}}">
                    <div class="relative block">
                        <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-500 bg-cover-gradient dark:border-gray-500"></div>
                        <div class="absolute left-1 bottom-2 drop-shadow-md">
                            <div class="px-1 text-xs font-bold text-white">{{album.name}}</div>
                            <div class="px-1 text-xs text-white">
                                {{album.artist.name}}
                            </div>
                        </div>
                        <img
                            src="{{album | album}}"
                            onerror="this.onerror=null; this.src='/assets/img/media/404.jpg'"
                            width="350"
                            height="350"
                            class="rounded-lg"
                            alt="{{album.name | escape}}"
                            loading="lazy"
                        />
                    </div>
                </a>
            {% endfor %}
        </div>
    </div>
{% endif %}
```

{% endraw %}

[Albums use a filter that, in this case, evaluates a denylist,](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/config/mediaFilters.js#L6-L10) simply a `string[]`, and replaces images contained therein. Anything not in the denylist is served directly from Last.fm:

```javascript
album: (media) => {
        const img = !ALBUM_DENYLIST.includes(media.name.replace(/\s+/g, '-').toLowerCase())
            ? media.image[media.image.length - 1]['#text']
            : `https://cdn.coryd.dev/artists/${media.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
        return img
```

Moving down the page, **Reading** data is sourced from [Oku](https://oku.club):

```javascript
const { extract } = require('@extractus/feed-extractor')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const url = 'https://oku.club/rss/collection/POaRa'
  const asset = new AssetCache('books_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await extract(url).catch((error) => {})
  const data = res.entries
  await asset.save(data, 'json')
  return data
}
```

Rather than dealing with a an API that returns JSON, I'm transforming the RSS feed that Oku exposes for my currently reading collection, using [@extractis/feed-extractor](https://www.npmjs.com/package/@extractus/feed-extractor) to transform the XML into JSON and leveraging Eleventy's [@11ty/eleventy-fetch](https://www.npmjs.com/package/@11ty/eleventy-fetch) package for caching. Because I'm simply rendering a list of what I'm reading, the liquid templating is a bit simpler:

{% raw %}

```liquid
{% if books %}
    <h2
        class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-6 mb-4"
    >
        Reading
    </h2>
    <div>
        <ul class="list-inside list-disc pl-5 md:pl-10">
        {% for book in books %}
            <li class="mt-1.5 mb-2">
                <a href="{{book.link}}" title="{{book.title | escape}}">
                    {{book.title}}
                </a>
            </li>
        {% endfor %}
        </ul>
    </div>
{% endif %}
```

{% endraw %}

For **Watching: movies** and **Watching: tv** we're following a nearly identical pattern (outside of object name semantics that are specific to the media type for each). Both Trakt and Letterboxd expose RSS feeds for watched media activity and both are passed through, fetched and cached using the same dependencies.

[You can view the tv.js data file here](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_data/tv.js) and [movies here](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_data/movies.js), while [the full `now.liquid` combines all of the discussed snippets](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/src/_includes/now.liquid).

Currently, this page is refreshed on an hourly basis using scheduled builds on Vercel triggered by GitHub actions, [which you can read about here](/posts/2023/scheduled-eleventy-builds-cron-github-actions/).

[^1]: You can learn more about /now pages [here](https://nownownow.com/about).
[^2]: They're awesome, easy to use and super-affordable. Highly recommended.
