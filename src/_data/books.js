const reading = require('./json/read.json')

module.exports = async function () {
  const books = reading.map(read => {
    return {
      title: read.title,
      cover: read.thumbnail.replace('https://books.google.com', 'https://books.coryd.dev').replace('&edge=curl',''),
      link: `https://openlibrary.org/search?q=${read.isbn}`,
      started: read.dateStarted,
      finished: read.dateFinished,
      status: read.status,
    }
  })
  return books.filter(book => book.status === 'started')
}
