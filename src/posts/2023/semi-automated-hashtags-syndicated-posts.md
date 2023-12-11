---
date: '2023-09-10'
title: 'Semi-automated hashtags for syndicated posts'
description: "I went out on a limb recently and decided to build a custom collection in Eleventy that aggregates my post tags and link tags (sourced from Matter). These tags then get appended to shared post or link titles when they're syndicated from my site."
draft: false
tags:
  - Eleventy
  - development
---
I went out on a limb recently and decided to build a custom collection in Eleventy that aggregates my post tags and link tags (sourced from [Matter](https://getmatter.com)). These tags then get appended to shared post or link titles when they're syndicated from my site.<!-- excerpt -->

The collection I built sits in my `.eleventy.js` file and looks like this:

```javascript
eleventyConfig.addCollection('tagMap', (collection) => {
    const tags = {}
    collection.getAll().forEach((item) => {
      if (item.data.collections.posts) {
        item.data.collections.posts.forEach((post) => {
          const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
          const tagString = [...new Set(post.data.tags.map((tag) => tagAliases[tag.toLowerCase()]))]
            .join(' ')
            .trim()
          if (tagString) tags[url] = tagString
        })
      }
      if (item.data.links) {
        item.data.links.forEach((link) => {
          const tagString = [...new Set(link.tags.map((tag) => tagAliases[tag.toLowerCase()]))]
            .join(' ')
            .trim()
          if (tagString) tags[link.url] = tagString
        })
      }
    })
    return tags
  })
```

This works by iterating through the posts and global link data available from `collections.getAll()` and then mapping each tag string to the associated url in a `tags` object. The `tags` object is returned and made available as `tagMap`.

Once the `tagMap` is available it's leveraged in a template that renders JSON feeds for my site — if `tagMap` is passed into the [LiquidJS](https://liquidjs.com/) render tag for the feed it's leveraged to help populate the title.

**The template:**

{% raw %}

```liquid
{%- assign entries = data | normalizeEntries -%}
{
  "version": "https://jsonfeed.org/version/1",
  "title": "{{ title }}",
  "icon": "https://coryd.dev/static/images/avatar.webp",
  "home_page_url": "{{ site.url }}",
  "feed_url": "{{ site.url }}{{ permalink }}",
  "items": [{% for entry in entries limit: 20 -%}
    {
    "id": "{{ entry.url | btoa }}",
    "title": "{{ entry.title | escape }}",
    "url": "{{ entry.url }}",
    "content_text": "{{ entry.title | escape }}{% if tagMap %} {{ entry.url | tagLookup: tagMap }}{% endif %} {{ entry.url }}",
    "date_published": "{{ entry.date | stringToDate | dateToRfc822 }}"
    }{% if not forloop.last %},{% endif %}
  {%- endfor %}
  ]
}
```

{% endraw %}

**Leveraging the template:**

{% raw %}

```liquid
{% render "partials/feeds/json.liquid"
  permalink:'/feeds/follow'
  title:'Follow • Cory Dransfeldt'
  data:follow.posts
  updated:follow.posts[0].date_published
  site:site
  tagMap:collections.tagMap
%}
```

{% endraw %}

**The exceedingly simple `tagLookup` filter:**

```javascript
tagLookup: (url, tagMap) => tagMap[url],
```

The static part of this whole setup is the `tagAliases` object referenced in my custom collection, which is a curated JSON object that maps tags I typically use between my blog and Matter to formatted hashtags to share and, as of writing, looks like this:

```json
{
  "11ty": "#Eleventy",
  "accessibility": "#Accessibility",
  "development": "#WebDev",
  "eleventy": "#Eleventy",
  "email": "#Email",
  "fastmail": "#Email",
  "gmail": "#Email",
  "javascript": "#JavaScript",
  "last.fm": "#Music",
  "lastfm": "#Music",
  "music": "#Music",
  "react": "#JavaScript",
  "social media": "#Tech",
  "spotify": "#Music",
  "tech": "#Tech",
  "technology": "#Tech"
}
```

So, with all of this in place, when my site builds it generates the `tagMap` collection, which is passed into my `json.liquid` feed template, that then looks up the matching tags via `tagLookup` before being syndicated using a GitHub action. The result is the same syndication that was in place before, but with a few additional tags to help with discovery.
