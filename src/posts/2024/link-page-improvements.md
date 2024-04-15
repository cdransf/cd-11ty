---
date: '2024-01-10'
title: 'Link page improvements'
description: "I made a few improvements to my link page that's powered by Readwise Reader."
tags:
  - 'development'
  - 'tech'
  - 'Eleventy'
---

I made a few quick improvements to my [links page](https://coryd.dev/links).<!-- excerpt -->

I've fetched the author from Readwise's Reader API and displayed it next to the time, which required the simple addition of a field to my `links.js` data file. Additionally, and perhaps more interestingly, when a link has been shared via [Nicolas Hoizey](https://nicolas-hoizey.com)'s [GitHub action](https://github.com/nhoizey/github-action-feed-to-mastodon), it's rendered with a Mastodon icon linking to said post.

Nicolas' GitHub action stores data about syndicated posts in a `cache` directory and one of the two files it creates contains an object where each post is represented by an object with the shared link used as the key for the object. These objects look like this:

```json
"https://hypercritical.co/2024/01/11/i-made-this": {
  "id": "aHR0cHM6Ly9oeXBlcmNyaXRpY2FsLmNvLzIwMjQvMDEvMTEvaS1tYWRlLXRoaXM=",
  "title": "🔗: I Made This",
  "url": "https://hypercritical.co/2024/01/11/i-made-this",
  "content_text": "🔗: I Made This #Tech https://hypercritical.co/2024/01/11/i-made-this",
  "date_published": "Thu, 11 Jan 2024 18:59:15 +0000",
  "toots": [
    "https://social.lol/users/cory/statuses/111739101741733921"
  ],
  "lastTootTimestamp": 1705003383562
}
```

With this data available, I created a `linkPosts.js` data file:

```javascript
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const mastodonCache = require('../../cache/jsonfeed-to-mastodon.json')

export default async function () {
  return mastodonCache
}
```

A simple filter handles the lookup when provided with the url and the data object:

```javascript
findPost: (url, posts) => {
  if (!url || !posts) return null;
  return posts[url]?.toots?.[0] || null;
},
```

This is then implemented in the `links.html` page template:

{% raw %}
```liquid
{%- assign shareLink = link.url | findPost: linkPosts -%}
<!-- template stuff -->
{%- if shareLink %}
  <a class="brand-mastodon icon-small" href="{{ shareLink }}">
    {% tablericon "brand-mastodon" "Mastodon post" %}
  </a>
{% endif -%}
<!-- more template stuff -->
```
{% endraw %}

With that in place my site will, eventually, link to the post for each link I share via a small Mastodon icon next to the date.