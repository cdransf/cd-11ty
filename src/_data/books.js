import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const books = require('./json/read.json')

export default async function () {
  return books.map(book => {
    let authors = ''
    let date = book?.['dateAdded']
    if (book['authors']?.length > 1) authors = book['authors'].join(', ')
    if (book['authors']?.length === 1) authors = book['authors'][0]
    if (book?.['dateStarted']) date = book['dateStarted']
    if (book?.['dateFinished']) date = book['dateFinished']

    return {
      title: book['title'],
      authors,
      description: book['description'],
      image: book['thumbnail'],
      url: `https://openlibrary.org/isbn/${book['isbn']}`,
      date,
      status: book['status'],
      tags: book['tags'],
      categories: book['categories']?.length > 1 ? book['categories'].join(', ') : book['categories']?.[0],
      rating: book['rating'] !== 'unrated' ? book['rating'] : '',
      type: 'book',
    }
  })
}
