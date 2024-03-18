---
date: '2024-03-18T15:30-08:00'
title: 'Lightweight search in Eleventy'
description: "I've been using Pagefind for my site search for a while now and would readily recommend it, but I wanted to throw together something a bit lighter weight and customizable."
tags: ['development', 'Eleventy', 'javascript']
---
I've been using [Pagefind](https://pagefind.app) for my site search for a while now and would readily recommend it, but I wanted to throw together something a bit lighter weight and customizable.<!-- excerpt -->

Enter [minisearch](https://www.npmjs.com/package/minisearch): a tiny full-text search library written in JavaScript. To populate it, I needed to generate an index (which Pagefind was previously handling for me):

```javascript
export const searchIndex = (collection) => {
  const searchIndex = []
  let id = 0
  const collectionData = collection.getAll()[0]
  const posts = collectionData.data.collections.posts
  const links = collectionData.data.links
  if (posts) {
    posts.forEach((post) => {
      const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
      searchIndex.push({
        id,
        url,
        title: `📝: ${post.data.title}`,
        text: post.data.description,
        tags: post.data.tags.filter((tag) => tag !== 'posts'),
      })
      id++;
    })
  }
  if (links) {
    links.forEach((link) => {
      searchIndex.push({
        id,
        url: link.url,
        title: `🔗: ${link.title}`,
        text: link.summary,
        tags: link.tags,
      })
      id++;
    })
  }
  return searchIndex
}
```

I've created a custom collection, above, that adds both post and link data (from [my links page](https://coryd.dev/links)) to a `searchIndex` array using a uniform object shape for each and the same emoji I use to distinguish the content types when [POSSE](https://indieweb.org/POSSE)-ing them out from my site. This allows both my posts and shared links to be searched which, previously, was not the case.

Next, this is exposed as `JSON` at `/api/search` via a liquid template:

{% raw %}
```liquid
---
layout: null
eleventyExcludeFromCollections: true
permalink: /api/search
---
{{ collections.searchIndex | json }}
```
{% endraw %}

Next, we need to copy the `minisearch` library JavaScript into our site output in `.eleventy.js`:

```javascript
eleventyConfig.addPassthroughCopy({
  'node_modules/minisearch/dist/umd/index.js': 'assets/scripts/components/minisearch.js',
})
```

From there, we write some basic event handling to leverage the library and pass in user input:

```javascipt
(() => {
  const miniSearch = new MiniSearch({
    fields: ['title', 'text', 'tags']
  })

  const $form = document.querySelector('.search__form')
  const $input = document.querySelector('.search__form--input')
  const $fallback = document.querySelector('.search__form--fallback')
  const $results = document.querySelector('.search__results')

  // remove noscript fallbacks
  $form.removeAttribute('action')
  $form.removeAttribute('method')
  $fallback.remove()

  let resultsById = {}

  // fetch index
  const results = fetch('/api/search').then(response => response.json())
  .then((results) => {
    resultsById = results.reduce((byId, result) => {
      byId[result.id] = result
      return byId
    }, {})
    return miniSearch.addAll(results)
  })

  $input.addEventListener('input', (event) => {
    const query = $input.value
    const results = (query.length > 1) ? getSearchResults(query) : []
    if (query === '') renderSearchResults([])
    renderSearchResults(results)
  })

  const getSearchResults = (query) => miniSearch.search(query, { prefix: true, fuzzy: 0.2, boost: { title: 2 } }).map(({ id }) => resultsById[id])
  const renderSearchResults = (results) => {
    $results.innerHTML = results.map(({ title, url }) => {
      return "`&lt;li class="search__results--result"&gt;&lt;a href="${url}"&gt;${title}&lt;/a&gt;&lt;/li&gt;`"
    }).join('\n')

    if (results.length > 0) {
      $results.classList.remove('hidden')
    } else {
      $results.classList.add('hidden')
    }
  }
})();
```

And, *finally*, I've added this all to my `search.html` page:

{% raw %}
```liquid
<script src="/assets/scripts/components/minisearch.js"></script>
{% capture js %}
{% render "../assets/scripts/search.js" %}
{% endcapture %}
<script type="module">{{ js }}</script>
<form class="search__form" action="https://duckduckgo.com" method="get">
  <input class="search__form--input" placeholder="Search" type="search" name="q" autocomplete="off" autofocus>
  <input class="search__form--fallback" type="hidden" placeholder="Search" name="sites" value="coryd.dev">
</form>
<ul class="search__results hidden"></ul>
```
{% endraw %}

It should also be noted that this JavaScript amounts to an *enhancement* — if the user does have JavaScript enabled, this all runs as explained and removes the fallback field and form action and method attributes. If it doesn't, searches of my site will be surfaced using [DuckDuckGo](https://duckduckgo.com).