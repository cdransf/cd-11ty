---
date: '2024-02-20'
title: 'Automatic Mastodon post embeds'
description: "I use Nicolas Hoizey's GitHub action to syndicate my web activity to Mastodon. Recently, I removed the display of webmentions from my posts after seeing Chris and Robb discuss some privacy concerns around them. Upon seeing David Darnes' mastodon-post web component, I've gone ahead and added it, conditionally, to the end of each of my posts."
tags: ['javascript', 'development', 'Eleventy', 'Mastodon']
---
I use [Nicolas Hoizey](https://nicolas-hoizey.com/)'s [GitHub action](https://github.com/nhoizey/github-action-feed-to-mastodon) to syndicate my web activity to Mastodon. Recently, I removed the display of webmentions from my posts after seeing [Chris](https://chrismcleod.dev/blog/some-words-on-webmentions/) and [Robb](https://rknight.me/blog/mastodon-webmentions-and-privacy/) discuss some privacy concerns around them. Upon seeing David Darnes' `mastodon-post` [web component](https://darn.es/mastodon-post-web-component/), I've gone ahead and added it, conditionally, to the end of each of my posts.<!-- excerpt -->

One of the many great things about Nicolas' GitHub Action is that it creates a cache file containing data about each of your syndicated posts and uses the shared URL as the key for the related object. I've exposed this cache using a simple data file called, appropriately, `linkPosts`:

```javascript
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const mastodonCache = require('../../cache/jsonfeed-to-mastodon.json')

export default async function () {
  return mastodonCache
}
```

The cache file contains a link to the Mastodon status, but includes the longer `/users/USERNAME/statuses/` path, while David's web component expects the shorter `/@USERNAME` path. I've created a filter that finds the Mastodon post for a shared post link and then updates the URL structure:

```javascript
findPost: (url, posts) => {
    if (!url || !posts) return null;
    const BASE_URL = 'https://social.lol/users/cory/statuses/'
    const STATUS_URL = 'https://social.lol/@cory/'
    return posts[url]?.toots?.[0].replace(BASE_URL, STATUS_URL) || null;
  },
```

This all lands in a `mastodon-post.liquid` partial that I render inside my post template:
{% raw %}
```liquid
{%- assign shareLink = postUrl | findPost: linkPosts -%}
{%- if shareLink %}
<script type="module" src="/assets/scripts/components/mastodon-post.js"></script>
<template id="mastodon-post-template">
  <div class="mastodon-post-wrapper">
    <blockquote data-key="content"></blockquote>
    <dl>
      <dt>{% tablericon "refresh" "Reposts" %}</dt>
      <dd data-key="reblogs_count"></dd>
      <dt>{% tablericon "message-circle" "Replies" %}</dt>
      <dd data-key="replies_count"></dd>
      <dt>{% tablericon "star" "Favorites" %}</dt>
      <dd data-key="favourites_count"></dd>
    </dl>
  </div>
</template>
<span class="client-side">
  <mastodon-post>
    <a href="{{ shareLink }}">
      Discuss on Mastodon
    </a>
  </mastodon-post>
</span>
{% endif -%}
```
{% endraw %}

When I post something, Nicolas' GitHub Action will, eventually, post it to Mastodon and commit the updated cache file which will cause my site to rebuild and, in turn, find the `shareLink` in my `mastodon-post.liquid` template above, rendering it on the appropriate post page (there'll be an example below this post in a bit).