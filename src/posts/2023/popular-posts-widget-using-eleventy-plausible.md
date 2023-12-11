---
date: '2023-07-12'
title: 'Building a popular posts widget in Eleventy using Plausible analytics'
description: "I took some time last week to build out a popular posts widget after seeing Zach's implementation using Google Analytics."
draft: false
tags: ['Eleventy', 'development']
---
I took some time last week to build out a popular posts widget after seeing [Zach's](https://www.zachleat.com) implementation using Google Analytics.<!-- excerpt -->

[Plausible offers access to an API to query and return stats collected from visitors to your site](https://plausible.io/docs/stats-api).

My request to Plausible's API looks like this:

```javascript
const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const API_KEY_PLAUSIBLE = process.env.API_KEY_PLAUSIBLE
  const url =
    'https://plausible.io/api/v1/stats/breakdown?site_id=coryd.dev&period=6mo&property=event:page&limit=30'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${API_KEY_PLAUSIBLE}`,
      },
    },
  }).catch()
  const pages = await res
  return pages.results.filter((p) => p.page.includes('posts')).splice(0, 5)
}
```

This is then passed to a custom filter ([based on code I originally stole from Zach](https://github.com/zachleat/zachleat.com/blob/bcce001529b7a08eadf752f62f2d8fc08798999f/_11ty/analyticsPlugin.js#L10)):

```javascript
getPopularPosts: (posts, analytics) => {
  return posts
    .filter((post) => {
      if (analytics.find((p) => p.page === post.url)) return true
    })
    .sort((a, b) => {
      const visitors = (page) => analytics.filter((p) => p.page === page.url).pop().visitors
      return visitors(b) - visitors(a)
    })
},
```

And rendered using a liquid template:
{% raw %}

```liquid
{% assign posts = posts | getPopularPosts: analytics %}
<div class="not-prose">
  <h2 class="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:inline icon--bold m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    {% tablericon "fire" "Popular" %}
    Popular posts
  </h2>
  <ul class="list-inside list-disc pl-5 md:pl-10">
    {% for post in posts %}
      <li class="mt-1.5 mb-2">
        <a href="{{post.url}}" title="{{ post.data.title | escape}}">
          {{ post.data.title }}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>
```

{% endraw %}

This can then be rendered just about anywhere using the following:
{% raw %}

```liquid
{% render "partials/popular-posts.liquid", posts: collections.posts, analytics: analytics %}
```

{% endraw %}
[And can be seen on my handy, dandy 404 (or search or any post page)](https://coryd.dev/404).
