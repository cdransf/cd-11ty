---
date: '2023-05-05'
title: 'Now page update: favorite articles from Matter'
draft: false
tags: ['Matter', 'development', 'Eleventy']
---

I dropped in a quick update to [my now page](/now) to display the 5 most recent articles from my favorites feed in [Matter](https://getmatter.com/).<!-- excerpt -->

To do this I'm borrowing from [Federico Viticci's method of obtaining a key for their api](https://www.macstories.net/stories/macstories-starter-pack-reverse-engineering-the-matter-api-and-my-save-to-matter-shortcut/) and using it to make a `GET` request to their `favorites_feed` endpoint:

```javascript
const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MATTER_TOKEN = process.env.ACCESS_TOKEN_MATTER
  const headers = { Authorization: `Bearer ${MATTER_TOKEN}` }
  const url = `https://web.getmatter.com/api/library_items/favorites_feed`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  })
  const feed = await res
  const articles = feed.feed.splice(0, 5)
  return articles
}
```

By following Federico's steps we can obtain a bearer token to access the API which will return an array of our favorited articles. This endpoint is paginated (e.g. passing `?page=1`, but I'm retrieving the full response, reversing the order and rendering the output to achieve the displayed result:

{% raw %}

```liquid
{% if articles %}
    <h2 class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-6 mb-4">
      Reading: favorite articles
    </h2>
    <div>
      <ul class="list-inside list-disc pl-5 md:pl-10">
        {% for article in articles | reverse %}
          <li class="mt-1.5 mb-2">
            <a href="{{article.content.url}}" title="{{article.content.title | escape}}">
              {{ article.content.title | escape }}{% if article.content.author.name %}
                by {{ article.content.author.name | escape }}{% endif %}
            </a>
          </li>
        {% endfor %}
      </ul>
    </div>
  {% endif %}
```

{% endraw %}

[You can see the result rendered here.](/now)
