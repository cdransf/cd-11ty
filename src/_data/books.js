const jsdom = require('jsdom')
const { AssetCache } = require('@11ty/eleventy-fetch')
const { JSDOM } = jsdom

module.exports = async function () {
  const COOKIE = process.env.COOKIE_STORYGRAPH
  const url = 'https://app.thestorygraph.com/currently-reading/coryd'
  const asset = new AssetCache('books_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const data = []
  await fetch(url, {
    headers: {
      Cookie: COOKIE,
    },
  })
    .then((res) => res.text())
    .then((html) => {
      const DOM = new JSDOM(html)
      const doc = DOM.window.document
      const bookCount = doc.querySelectorAll('.md\\:block .book-pane-content').length
      const titles = doc.querySelectorAll('.md\\:block .book-title-author-and-series h3 > a')
      const authors = doc.querySelectorAll(
        '.md\\:block .book-title-author-and-series h3 p:last-of-type > a'
      )
      const images = doc.querySelectorAll('.md\\:block .book-cover img')
      const urls = doc.querySelectorAll('.md\\:block .book-cover a')
      const percentages = doc.querySelectorAll('.md\\:block .progress-tracker-pane .font-semibold')
      const dates = doc.querySelectorAll('.md\\:block .action-menu a > p')

      for (let i = 0; i < bookCount; i++) {
        if (!data[i]) {
          data.push({ title: titles[i].textContent })
          data.push({ author: authors[i].textContent })
          data.push({
            image: images[i].src.replace(
              'https://cdn.thestorygraph.com',
              'https://cd-books.b-cdn.net'
            ),
          })
          data.push({ url: `https://app.thestorygraph.com${urls[i].href}` })
          data.push({ percentage: percentages[i].textContent })
          data.push({
            dateAdded: dates[i]
              ? new Date(dates[i].textContent.replace('Started ', '').split('\n')[0])
              : new Date(),
          })
          data.push({ type: 'book' })
        }

        if (data[i]) {
          data[i]['title'] = titles[i].textContent
          data[i]['author'] = authors[i].textContent
          data[i]['image'] = images[i].src.replace(
            'https://cdn.thestorygraph.com',
            'https://cd-books.b-cdn.net'
          )
          data[i]['url'] = `https://app.thestorygraph.com${urls[i].href}`
          data[i]['percentage'] = percentages[i].textContent
          data[i]['dateAdded'] = dates[i]
            ? new Date(dates[i].textContent.replace('Started ', '').split('\n')[0])
            : new Date()
          data[i]['type'] = 'book'
        }
      }
    })
  const books = data.filter((book) => book.title)
  await asset.save(books, 'json')
  return books
}
