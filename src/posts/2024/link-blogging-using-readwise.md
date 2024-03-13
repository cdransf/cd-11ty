---
date: '2024-01-10'
title: 'Link blogging using Readwise Reader'
description: 'How I use Readwise Reader to post and share links.'
tags:
  - 'development'
  - 'tech'
  - 'Eleventy'
---
I use Readwise Reader's API to populate the links on [my now page](https://coryd.dev/now). These then get included in [my follow feed](https://feedpress.me/coryd-follow) that's syndicated out to Mastodon using a [GitHub action](https://github.com/nhoizey/github-action-feed-to-mastodon) authored by [Nicolas Hoizey](https://nicolas-hoizey.com).<!-- excerpt -->

The `data` file used to fetch these links looks like this:

```javascript
import EleventyFetch from '@11ty/eleventy-fetch'

export default async function () {
  const API_TOKEN_READWISE = process.env.API_TOKEN_READWISE
  const url = 'https://readwise.io/api/v3/list?location=archive'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        Authorization: `Token ${API_TOKEN_READWISE}`,
      },
    },
  }).catch()
  const data = await res
  const links = data['results'].map((link) => {
    return {
      title: link['title'],
      url: link['source_url'],
      tags: [...new Set(Object.keys(link['tags']))],
      date: link['created_at'],
      summary: link['summary'],
      note: link['notes'],
      description: `${link['summary']}<br/><br/>`,
    }
  })
  return links.filter((link) => link.tags.includes('share'))
}
```

This fetches links from my archive (so that it's much more likely that I've read them) and includes them on my now page via a `links.liquid` partial that looks like this:

{% raw %}
```liquid
{% if links.size > 0 %}
  <h2 class="flex--centered">
    {% tablericon "link" "Links" %}
    Links
  </h2>
  <ul class="link__list">
    {% for link in links limit: 5 %}
      <li>
        <a class="no-underline" href="{{link.url}}" title="{{link.title | escape}}">
          {{ link.title }}
        </a>
      </li>
    {% endfor %}
  </ul>
{% endif %}
```
{% endraw %}

Now, however, I've gone ahead and added the `notes` field from Readwise's API response to the `data` I expose in my `links.js` file above and constructed [an additional top level page](/links), complete with pagination. This top level page formats my shared links much like the posts on my home page, adds the summary Readwise fetches as a `<blockquote>` and, if I've added notes to the document (which I'll now aim to do more consistently), it will render them below the `<blockquote>`. Now, *all* of the links I've shared are at least visible *somewhere* on my site instead of the five most recent on [my now page](/now). The `links` page template looks like this:

{% raw %}
```liquid
---
title: Links
layout: default
pagination:
  data: links
  size: 8
---
{% for link in pagination.items %}
<article class="h-entry" data-pagefind-body>
  <a class="no-underline" href="{{ link.url }}">
    <h2 class="flex--centered" data-pagefind-meta="title">{{ link.title }}</h2>
  </a>
  <time class="dt-published" datetime="{{ link.date }}">
    {{ link.date | date: "%m.%Y" }}
  </time>
  <blockquote class="p-summary">{{ link.summary }}</blockquote>
  {%- if link.note %}
    <p>{{ link.note }}</p>
  {% endif -%}
</article>
{% endfor %}
{% include "partials/paginator.liquid" %}
```
{% endraw %}

There you have it — link blogging via Readwise Reader[^1].

[^1]: Or lazy link blogging, if you'd prefer.