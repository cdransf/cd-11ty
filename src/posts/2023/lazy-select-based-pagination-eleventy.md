---
date: '2023-03-27'
title: 'Lazy select-based pagination in Eleventy'
description: "I've relaunched, rebuilt and rewritten my personal blog more times than I can count, and I've had a trail of posts I've never fully migrated at each turn. This weekend, while relaxing and watching movies I ported them into Eleventy and, in doing so, found that the pagination implementation I was using didn't scale well with the number of pages I added."
tags: ['Eleventy', 'javascript', 'development']
---

I've relaunched, rebuilt and rewritten my personal blog more times than I can count, and I've had a trail of posts I've never fully migrated at each turn. This weekend, while relaxing and watching movies I ported them into Eleventy and, in doing so, found that the pagination implementation I was using didn't scale well with the number of pages I added.<!-- excerpt -->

I quickly explored having the current page act as a floating index of sorts wherein I would cap the number of pages shown at, say, `5` and then show the previous and next two pages on either side. Limiting the rendered count in [liquid.js](https://liquidjs.com/) was as simple as using the `limit` filter, but tracking the floating index and numbers on either side was more difficult than I would have liked.

Given that I was already iterating through all pages in my posts collection, my next thought (and the choice I ran with) was to fold all the enumerated values into a `<select>` and use that to give users more control when paging. That select lives in [`paginator.liquid#17-28`](https://github.com/cdransf/coryd.dev/blob/78f6cfa93b6caaf6d82e9085939df9d2a14fc389/src/_includes/paginator.liquid#L17-L28) and looks like this:

```html
  <div class="flex flex-row items-center">
    <select
      id="pagination"
      class="block w-12 h-12 rounded-full text-white dark:text-gray-900 bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-300 mr-1 focus-visible:outline-none focus-visible:bg-blue-400 appearance-none text-centered"
      style="text-align-last:center">
      {% for pageEntry in pagination.pages %}
        <option {% if page.url == pagination.hrefs[forloop.index0] %}selected{% endif %} value="{{ forloop.index }}">{{ forloop.index }}</option>
      {% endfor %}
    </select>
    <span>
      of {{ pagination.links.size }}</span>
  </div>
```

When the select is changed, Javascript is executed to update the current uri to the appropriate page — that logic lives in an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) in [`base.liquid`](https://github.com/cdransf/coryd.dev/blob/78f6cfa93b6caaf6d82e9085939df9d2a14fc389/src/_includes/base.liquid#L74-L88):

```javascript
(function() {
    const pagination = document.getElementById('pagination');
        if (pagination) {
          pagination.addEventListener('change', (event) => {
            const page = parseInt(event.target.value)
            if (page === 1) {
              window.location.href = '/'
            } else {
              window.location.href = `/${
                event.target.value - 1
              }/`
            }
        })
    }
})()
```

[You can see all of that rendered here.](https://coryd.dev/#pagination)
