---
date: '2023-10-23'
title: 'Onward, to The Storygraph'
draft: false
tags: ['Eleventy', 'development']
---

Recently, I've been using Goodreads, begrudgingly, to track my reading activity. I had been using [Oku](https://oku.club) but wanted to hedge against the lack of updates since 2022 or so. Looking around for an alternative, I found and read many good things about The Storygraph. It fits my needs, but doesn't (yet) have an API or RSS/Atom feeds exposed for your reading activity. With this in mind, I went ahead and imported my Goodreads activity and set about thinking of a way to preserve the reading activity I expose as an RSS feed and on the [now](https://coryd.dev/now) of my site.<!-- excerpt -->

The solution I've arrived at is, well, web-scraping. it looks like this:

```javascript
const jsdom = require('jsdom')
const { AssetCache } = require('@11ty/eleventy-fetch')
const { JSDOM } = jsdom

module.exports = async function () {
  const url = 'https://app.thestorygraph.com/currently-reading/coryd'
  const asset = new AssetCache('books_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const data = []
  await fetch(url)
    .then((res) => res.text())
    .then((html) => {
      const DOM = new JSDOM(html)
      const doc = DOM.window.document
      doc
        .querySelectorAll('.md\\:block .book-title-author-and-series h3 > a')
        .forEach((title, index) => {
          if (!data[index]) data.push({ title: title.textContent })
          if (data[index]) data[index]['title'] = title.textContent
        })
      doc
        .querySelectorAll('.md\\:block .book-title-author-and-series h3 p:last-of-type > a')
        .forEach((author, index) => {
          if (!data[index]) data.push({ author: author.textContent })
          if (data[index]) data[index]['author'] = author.textContent
        })
      doc.querySelectorAll('.md\\:block .book-cover img').forEach((image, index) => {
        const img = image.src.replace('https://cdn.thestorygraph.com', 'https://cd-books.b-cdn.net')
        if (!data[index]) data.push({ image: img })
        if (data[index]) data[index]['image'] = img
      })
      doc.querySelectorAll('.md\\:block .book-cover a').forEach((url, index) => {
        if (!data[index]) data.push({ url: `https://app.thestorygraph.com${url.href}` })
        if (data[index]) data[index]['url'] = `https://app.thestorygraph.com${url.href}`
      })
    })
  const books = data
    .filter((book) => book.title)
    .map((book) => {
      book.type = 'book'
      book.dateAdded = new Date()
      return book
    })
  await asset.save(books, 'json')
  return books
}
```

First, we fetch `'https://app.thestorygraph.com/currently-reading/coryd'`, which is the view of books I'm actively reading and parse the response to text. Once we have the page text, we use [jsdom](https://github.com/jsdom/jsdom)[^1] to query for the selectors enclosing the information we need.

The Storygraph DOM includes two different layouts for the books you're reading: one shown at `.md:block` and a mobile-friendly version at smaller viewports. To avoid collecting duplicate data from the DOM, we can scope our selectors using `.md\\:block`[^2]. We the iterate through the NodeList returned by `querySelectorAll`, adding or updating objects in a `data` array as needed. The final data object exposed to our templates looks like this:

```javascript
{
  author: string,
  image: string,
  url: string,
  type: string,
}[]
```

With that in place, I have the same data displayed and syndicated but without the stopgap dependence on a platform owned by Amazon.

[^1]: We're not fetching this from the browser, so we can't leverage native APIs to deal with the HTML.
[^2]: The `\\` is necessary to escape the `:block` pseudo-selector which the `querySelectorAll` otherwise treats as invalid.
