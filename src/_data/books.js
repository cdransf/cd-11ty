import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const books = require('./json/read.json')

export default async function () {
  return books.map(book => {
    let authors = ''
    if (book['authors']?.length > 1) authors = book['authors'].join(', ')
    if (book['authors']?.length === 1) authors = book['authors'][0]

    return {
      title: book['title'],
      authors,
      description: book['description'],
      image: encodeURIComponent(book['thumbnail'].replace('&edge=curl', '')),
      url: `https://openlibrary.org/isbn/${book['isbn']}`,
      dateAdded: book?.['dateStarted'] || book?.['dateFinished'],
      status: book['status'],
      tags: book['tags'],
      categories: book['categories']?.length > 1 ? book['categories'].join(', ') : book['categories']?.[0],
      type: 'book',
    }
  })
}
