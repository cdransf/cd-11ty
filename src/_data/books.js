import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const books = require('./json/read.json')

export default async function () {
  return books.map(book => (
    {
      title: book['title'],
      authors: book['authors'].length > 1 ? book['authors'].join(', ') : book['authors'][0],
      description: book['description'],
      image: `https://coryd.dev/.netlify/images/?url=${encodeURIComponent(book['thumbnail'].replace('&edge=curl', ''))}&fit=cover&w=200&h=307`,
      url: `https://openlibrary.org/isbn/${book['isbn']}`,
      dateAdded: book['dateStarted'],
      status: book['status'],
      type: 'book',
    }
  ))
}
