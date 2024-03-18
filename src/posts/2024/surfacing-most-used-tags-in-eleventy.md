---
date: '2024-03-09'
title: 'Surfacing most used tags in Eleventy'
description: "I made some lightweight design changes to my site, keeping things simple but moving the date up above post headers, surfacing tags below and restoring `Read more` links."
tags: ['Eleventy', 'development', 'javascript']
---
I made some lightweight design changes to my site, keeping things simple but moving the date up above post headers, surfacing tags below and restoring `Read more` links.<!-- excerpt -->

As part of this I dropped my dedicated Tags page and built a collection to surface my most used tags, sorted in descending order that I could display in a reusable Liquid partial. I use this partial to populate post tags and new tag displays on my search page, 404 and contact success views. The code for the collection looks like this:

```javascript
export const tagsSortedByCount = (collectionApi) => {
  const tagStats = {};
  const posts = collectionApi.getFilteredByGlob('src/posts/**/*.*');
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      if (!tagStats[tag]) tagStats[tag] = 1;
      if (tagStats[tag]) tagStats[tag] = tagStats[tag] + 1;
    });
  });
  const deletedTags = ['posts'];
  deletedTags.forEach(tag => delete tagStats[tag]);
  const tagStatsArr = Object.entries(tagStats);
  return tagStatsArr.sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key}`);
}
```

I pass in the collection API, filter for posts using the `getFiltedByGlob` method and then iterate through each post object, then through the tags contained therein[^1]. This is done to build an object containing each tag as a key and the frequency of use as a value.

Finally, I iterate through my `deletedTags` array (which could contain anything you'd like), generate an array from the `tagStats` object, sort it by cound and return an array of strings in the proper order.

This `tagsSortedByCount` collection is imported into my `.eleventy.js` along with my other custom collections:

```javascript
import { tagList, tagMap, postStats, tagsSortedByCount } from './config/collections/index.js'
...
eleventyConfig.addCollection('tagsSortedByCount', tagsSortedByCount)
````

And can then be leveraged in my Liquid partial as follows:

{% raw %}
```liquid
{% render "partials/tags.liquid", tags:collections.tagsSortedByCount %}
```
{% endraw %}

The partial displays up to `10` tags:

{% raw %}
```liquid
{% assign filteredTags = tags | filterTags %}
{% for tag in filteredTags limit: 10 %}
  <a class="tag" href="/tags/{{ tag | downcase }}">{{ tag | formatTag }}</a>
{% endfor %}
```
{% endraw %}

While also making use of a filter to format the tags for display called `formatTag`:

```javascript
formatTag: (string) => {
  const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
  if (string === 'iOS' || string === 'macOS') return `#${string}`
  if (!string.includes(' ')) return `#${capitalizeFirstLetter(string)}`
  return `#${string.split(' ').map(s => capitalizeFirstLetter(s)).join('')}`
}
```

Now, with all that in place, I can consistently display post and most used tags across my site.

[^1]: Nested loops, gross, I know.