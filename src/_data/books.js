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
        if (!data[index]) data.push({ image: image.src })
        if (data[index]) data[index]['image'] = image.src
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
