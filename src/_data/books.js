const Parser = require('rss-parser')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const parser = new Parser({
    customFields: {
      item: ['book_large_image_url', 'isbn', 'book_description', 'user_date_added'],
    },
  })
  const url = process.env.SECRET_FEED_GOODREADS
  const asset = new AssetCache('books_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const data = []
  const res = await parser.parseURL(url).catch((error) => {
    console.log(error.message)
  })
  res.items.forEach((book) => {
    data.push({
      image: book['book_large_image_url'].replace(
        'https://i.gr-assets.com',
        'https://books.coryd.dev'
      ),
      title: book['title'],
      url: book['link'],
      isbn: book['isbn'],
      description: `${book['book_description']}<br/><br/>`,
      dateAdded: book['user_date_added'],
      type: 'book',
    })
  })
  const books = data.splice(0, 6)
  await asset.save(books, 'json')
  return books
}
