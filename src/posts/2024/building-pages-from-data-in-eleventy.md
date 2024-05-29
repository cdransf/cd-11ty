---
date: 2024-05-24T09:45-08:00
title: Building pages from data in Eleventy
description: I've expanded the media sections I already had built to include pages generated from data using Eleventy.
tags:
  - tech
  - development
  - eleventy
---
I've expanded [the media sections I already had built](https://coryd.dev/posts/2024/adventures-in-self-hosting-data/) to include pages generated from data using Eleventy.<!-- excerpt -->

The motivation for this has been to move further towards hosting data that I feel is core to my site on infrastructure I control. My book data is in a versioned JSON file, my music, movie and TV data reside in a database. When my site is built, each book, musician, movie and show has a page built for it.

Aggregating this data was, to be fair, extremely tedious up front. Importing plays for music was fairly straightforward, while gathering artist bios and genres was much more time-consuming.

With the data for each type of media in place, I fetched it from Supabase:

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const getCountryName = (countryCode) => regionNames.of(countryCode.trim()) || countryCode.trim()

const parseCountryField = (countryField) => {
  if (!countryField) return null

  const delimiters = [',', '/', '&', 'and']
  let countries = [countryField]

  delimiters.forEach(delimiter => {
    countries = countries.flatMap(country => country.split(delimiter))
  })

  return countries.map(getCountryName).join(', ')
}

const PAGE_SIZE = 50

const fetchPaginatedData = async (table, selectFields) => {
  let data = []
  let page = 0
  let hasMoreRecords = true

  while (hasMoreRecords) {
    const { data: pageData, error } = await supabase
      .from(table)
      .select(selectFields)
      .order('id', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      break
    }

    data = data.concat(pageData)

    if (pageData.length < PAGE_SIZE) {
      hasMoreRecords = false
    } else {
      page++
    }
  }

  return data
}

export default async function () {
  const artists = await fetchPaginatedData('artists', 'mbid, name_string, image, genre, total_plays, country, description, favorite')
  const albums = await fetchPaginatedData('albums', 'mbid, name, release_year, artist_mbid, total_plays')

  const albumsByArtist = albums.reduce((acc, album) => {
    if (!acc[album.artist_mbid]) acc[album.artist_mbid] = []
    acc[album.artist_mbid].push({
      id: album.id,
      name: album.name,
      release_year: album.release_year,
      total_plays: album.total_plays > 0 ? album.total_plays : '-'
    })
    return acc
  }, {})

  artists.forEach(artist => {
    artist.albums = albumsByArtist[artist.mbid]?.sort((a, b) => a['release_year'] - b['release_year']) || []
    artist.country = parseCountryField(artist.country)
  })

  return artists
}
```

This pages through my artists table, fetches the metadata I've assembled it and returns it as an array of artists with a child array of albums. This can then be used to generate a static page for each artist:

{% raw %}
```liquid
---
layout: default
pagination:
  data: artists
  size: 1
  alias: artist
permalink: /music/artists/{{ artist.name_string | slugify | downcase }}-{{ artist.country | slugify | downcase}}/
updated: "now"
schema: artist
---
{%- capture alt -%}
  {{ artist.name_string }} • {{ artist.country }}
{%- endcapture -%}
{% capture js %}
  {% render "../../../../assets/scripts/text-toggle.js" %}
{% endcapture %}
<script>{{ js }}</script>
<noscript><style>[data-toggle-content].text-toggle-hidden {height: unset !important;overflow: unset !important;margin-bottom: unset !important;}[data-toggle-content].text-toggle-hidden::after {display: none !important;}</style></noscript>
<a class="back-link-header link-icon flex-centered" href="/music">{% tablericon "arrow-left" "Go back" %} Go back</a>
<article class="artist-focus">
  <div class="artist-display">
    <img src="https://coryd.dev/.netlify/images/?url={{ artist.image }}&fm=webp&q=50&w=240&h=240&fit=cover" alt="{{ alt }}" loading="eager" decoding="async" width="240" height="240" />
    <div class="artist-meta">
      <p class="title"><strong>{{ artist.name_string }}</strong></p>
      {%- if artist.favorite -%}
        <p class="sub-meta favorite flex-centered">{% tablericon "heart" "Favorite" %} This is one of my favorite artists!</p>
      {%- endif -%}
      {%- if artist.total_plays > 0 -%}
        <p class="sub-meta"><strong class="highlight-text">{{ artist.total_plays }} plays</strong></p>
      {%- endif -%}
      <p class="sub-meta">{{ artist.genre }}</p>
      <p class="sub-meta">
        <a class="brain" href="https://musicbrainz.org/artist/{{ artist.mbid }}">{% tablericon "brain" "MusicBrainz" %}</a>
      </p>
    </div>
  </div>
  {%- if artist.description -%}
  <div data-toggle-content class="text-toggle-hidden">{{ artist.description | markdown }}</div>
  <button data-toggle-button>Show more</button>
  {%- endif -%}
  <table>
    <tr>
      <th>Year</th>
      <th>Title</th>
      <th>Plays</th>
    </tr>
    {% for album in artist.albums %}
    <tr>
      <td>{{ album.release_year }}</td>
      <td>{{ album.name }}</td>
      <td>{{ album.total_plays }}</td>
    </tr>
    {% endfor %}
  </table>
  <p class="text-small text-centered"><em>These are the album by this artist that are in my collection, not necessarily a comprehensive discography.</em></p>
</article>
```
{% endraw %}

Each artist has an image, a name, a play count (hopefully), a genre, location and an indication that they're a favorite if I've manually toggled the appropriate `boolean` to true. The most important part of this template is the frontmatter: pagination is set to a size of one, the data for each page is aliased to `artist` and the `permalink` logic provides a unique URL for each page.

Each link from a music page or item is pointed at the appropriate artist by generating the appropriate URL using identical logic.

I've taken the same approach for all of my media, allowing me to syndicate links out that point back to content on my site, while still linking out from those pages as appropriate.