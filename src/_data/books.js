import jsdom from 'jsdom'
import { AssetCache } from '@11ty/eleventy-fetch'
import BooksMock from './json/mocks/books.js'

const { JSDOM } = jsdom

export default async function () {
  const COOKIE = process.env.COOKIE_STORYGRAPH
  const url = 'https://app.thestorygraph.com/currently-reading/coryd'
  if (process.env.ELEVENTY_PRODUCTION) {
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
        const bookCount = doc.querySelectorAll('.book-pane-content').length
        const titles = doc.querySelectorAll('.book-title-author-and-series h3 > a')
        const authors = doc.querySelectorAll('.book-title-author-and-series h3 p:last-of-type > a')
        const images = doc.querySelectorAll('.md\\:block .book-cover img')
        const urls = doc.querySelectorAll('.md\\:block .book-cover a')
        const percentages = doc.querySelectorAll('.md\\:block .progress-tracker-pane .font-semibold')
        const dates = doc.querySelectorAll('.md\\:block .action-menu a p')

        for (let i = 0; i < bookCount; i++) {
          const date = new Date(
            dates[i]?.textContent.replace('Started ', '').split('\n')[0]
            ).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
            })

          if (!data[i]) {
            data.push({ title: titles[i]?.textContent })
            data.push({ author: authors[i]?.textContent })
            data.push({
              image: images[i].src.replace(
                'https://cdn.thestorygraph.com',
                'https://cd-books.b-cdn.net'
              ),
            })
            data.push({ url: `https://app.thestorygraph.com${urls[i].href}` })
            data.push({ percentage: percentages[i]?.textContent })
            data.push({
              dateAdded: date,
            })
            data.push({ type: 'book' })
          }

          if (data[i]) {
            data[i]['title'] = titles[i]?.textContent
            data[i]['author'] = authors[i]?.textContent
            data[i]['image'] = images[i]?.src.replace(
              'https://cdn.thestorygraph.com',
              'https://cd-books.b-cdn.net'
            )
            data[i]['url'] = `https://app.thestorygraph.com${urls[i]?.href}`
            data[i]['percentage'] = percentages[i]?.textContent
            data[i]['dateAdded'] = date
            data[i]['type'] = 'book'
          }
        }
      })
    const books = data.filter((book) => book.title)
    await asset.save(books, 'json')
    return books
  } else {
    return BooksMock
  }
}
