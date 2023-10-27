---
date: '2023-09-03'
title: Drying up now page templates and normalizing data in Eleventy
draft: false
tags:
  - Eleventy
  - development
  - JavaScript
---

My now page consists of a number of similar sections — some bespoke text, a number of media grids and lists. The text is repeated once, the lists are easily templated out in [Liquid.js](https://liquidjs.com/) and the media grids are all quite similar. Given the prominence of the media grids on the page and the number of them I decided to consolidate them into a single template while also normalizing the data passed into them as best I could.<!-- excerpt -->

If you want to skip all the reading, the diff for this [is here](https://github.com/cdransf/coryd.dev/commit/6dda493d7b6c0435bac8ee2a55179e9e1afb7acd). There were a few steps to take to get this done. First I went ahead and took an existing media template and went to work reconciling the slight differences between the artist, album, book, tv and movie displays as follows:

{% raw %}

```liquid
{% if data.size > 0 %}
  {% assign media = data | normalizeMedia %}
  <h2 class="icon--bold m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4 [&>svg]:h-7 [&>svg]:w-7">
    {% tablericon icon title %}
    <div class="ml-1">{{ title }}</div>
  </h2>
  <div class="grid gap-2 {% if shape == 'square' %}grid-cols-2 md:grid-cols-4{% else %}grid-cols-3 md:grid-cols-6{% endif %} not-prose">
    {% for item in media limit: count %}
      {% assign alt = item.alt | strip %}
      <a href="{{ item.url | stripUtm }}" title="{{ alt | escape }}">
        <div class="relative block h-full"{% if shape != 'square' %} style="max-width:226px"{% endif %}>
          <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-600 hover:border-pink-500 dark:border-purple-400 dark:hover:border-pink-500 ease-in-out duration-300{% if item.title %} bg-cover-gradient{% endif %}"></div>
          <div class="absolute left-1 bottom-2 drop-shadow-md">
            {% if item.title %}
              <div class="px-1 text-xs font-bold text-white line-clamp-2">{{ item.title }}</div>
            {% endif %}
            {% if item.subtext %}
              <div class="px-1 text-xs text-white line-clamp-2">
                {{ item.subtext }}
              </div>
            {% endif %}
          </div>
          {%- capture size %}{% if shape == 'square' %}225px{% else %}180px{% endif %}{% endcapture -%}
          {% image item.image, alt, 'rounded-lg w-full h-full' %}
        </div>
      </a>
    {% endfor %}
  </div>
{% endif %}
```

{% endraw %}

We pass in the data to populate the section as `data` which is passed to the `normalizeMedia` filter and assigned to a `media` variable. The `normalizeMedia` filter does a few things:

```javascript
module.exports = {
  normalizeMedia: (media) =>
    media.map((item) => {
      let normalized = {
        image: item['image'],
        url: item['url'],
      }
      if (item.type === 'album') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = item['artist']
      }
      if (item.type === 'artist') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['plays']} plays of ${item['title']}`
        normalized['subtext'] = `${item['plays']} plays`
      }
      if (item.type === 'book') normalized['alt'] = item['title']
      if (item.type === 'movie') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} - ${item['summary']}`
      }
      if (item.type === 'tv') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} from ${item['name']}`
        normalized['subtext'] = `${item.name} • <strong>${item.episode}</strong>`
      }
      return normalized
    }),
}
```

Most notably the filter populates an object with the properties known to be common to each media type. Next, it iterates through the `media` object, checks the `type` property and mutates the `normalized` object to include properties specific to the given media type. When returned, our normalized media object can then be iterated through to populate a given media grid. For example, the `tv` media type maps `'title'` to `'title'`, `${item['title']} from ${item['name']}` to `'alt'` and so forth. This allows each different media type to be rendered in a grid that supports an object shape like this:

```typescript
{
  image: string,
  url: string,
  title: string,
  alt: string,
  subtext?: string
}[]
```

This normalization is made easier by updating the shape of the objects returned by my site's `_data` files to better align with the object shape required by the `normalizeMedia` filter. For example (from `artists.js`):

```javascript
return {
  title: artist['name'],
  plays: artist['playcount'],
  rank: artist['@attr']['rank'],
  image:
    `https://cdn.coryd.dev/artists/${artist['name'].replace(/\s+/g, '-').toLowerCase()}.jpg` ||
    'https://cdn.coryd.dev/artists/missing-artist.jpg',
  url: artist['mbid']
    ? `https://musicbrainz.org/artist/${artist['mbid']}`
    : `https://musicbrainz.org/search?query=${encodeURI(artist['name'])}&type=artist`,
  type: 'artist',
}
```

This aligns `image` and `url` with the expected defaults in `normalizeMedia` with the remaining data being mapped inside of the `if (item.type === 'artist')` condition to align with the expectations of the `media-grid.liquid` template. Whew.

Now, leveraging this looks like the following:

{% raw %}

```liquid
{% render "partials/now/media-grid.liquid", data:artists, icon: "microphone-2", title: "Artists", shape: "square", count: 8, loading: 'eager' %}
```

{% endraw %}

We use the [liquid.js render tag](https://liquidjs.com/tags/render.html) and pass in a number of things: `data` which accepts the data returned by our `artists.js` data file, an `icon` of our choosing, a `title` of our choosing, a `shape` (as artist/albums are square and our remaining sets are rendered as vertical images), a `count` of items to render and the `loading` strategy to leverage (`artists` load above the fold and, hence, adopt the `'eager'` strategy — the rest are below the fold and default to `'lazy'`). My full `now.liquid` file now looks like this:

{% raw %}

```liquid
---
layout: main
---
{% render "partials/header.liquid", site: site, page: page, nav: nav %}
{{ content }}
{% render "partials/now/media-grid.liquid", data:artists, icon: "microphone-2", title: "Artists", shape: "square", count: 8, loading: 'eager' %}
{% render "partials/now/media-grid.liquid", data:albums, icon: "vinyl", title: "Albums", shape: "square", count: 8, loading: 'lazy' %}
{% render "partials/now/albumReleases.liquid", albumReleases:albumReleases %}
{% render "partials/now/media-grid.liquid", data:books, icon: "books", title: "Books", shape: "vertical", count: 6, loading: 'lazy' %}
{% render "partials/now/links.liquid", links:links %}
{% render "partials/now/media-grid.liquid", data:movies, icon: "movie", title: "Movies", shape: "vertical", count: 6, loading: 'lazy' %}
{% render "partials/now/media-grid.liquid", data:tv, icon: "device-tv", title: "TV", shape: "vertical", count: 6, loading: 'lazy' %}
<p class="text-xs text-center pt-6">This is a
  <a href="https://nownownow.com/about">now page</a>, and if you have your own site,
  <a href="https://nownownow.com/about">you should make one too</a>.</p>
```

{% endraw %}
