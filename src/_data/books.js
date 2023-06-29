const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const OKU_URL = 'https://oku.club/api/collections/user/cory/reading'
  const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json?title='
  const res = EleventyFetch(OKU_URL, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  const books = []
  for (const book of data['books']) {
    const res = await fetch(`${OPEN_LIBRARY_URL}${book.title.replace(/\s+/g, '+')}`)
      .then((res) => res.json())
      .catch()
    const data = await res
    const coverId = data['docs'].find((b) => {
      return b['author_name'][0] === book['authors'][0].name
    })?.['cover_i']
    books.push({
      title: book.title,
      url: `https://oku.club/book/${book.slug}`,
      cover: coverId
        ? `https://books.coryd.dev/b/id/${coverId}-L.jpg`
        : `https://cdn.coryd.dev/books/${book.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    })
  }
  return books
}
