const reading = require('./json/read.json')

module.exports = async function () {
  return reading.map(read => {
    if (read.status === 'started') return {
      title: read.title,
      author: read.authors.length > 1 ? read.authors.join(', ') : read.authors.pop(),
      cover: read.thumbnail.replace('https://books.google.com', 'https://books.coryd.dev'),
      link: `https://openlibrary.org/search?q=${read.isbn}`,
      started: read.dateStarted,
      finished: read.dateFinished
    }
  })
}
