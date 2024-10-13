export default {
  bookStatus: (books, status) => books.filter(book => book['status'] === status),
  bookFavorites: (books) => books.filter(book => book.favorite === true),
  bookYearLinks: (years) => years.sort((a, b) => b.value - a.value).map((year, index) => {
    const separator = index < years.length - 1 ? ' / ' : ''
    return `<a href="/books/years/${year.value}">${year.value}</a>${separator}`
  }).join(''),
  bookFinishedYear: (books, year) => books.filter(book => {
    if (book['status'] === 'finished' && book['year']) return parseInt(book['year']) === parseInt(year)
    return ''
  }),
  sortByPlaysDescending: (data, key) => data.sort((a, b) => b[key] - a[key]),
  mediaLinks: (data, type, count = 10) => {
    if (!data || !type) return ''

    const dataSlice = data.slice(0, count)

    if (dataSlice.length === 0) return null
    if (dataSlice.length === 1) {
      const item = dataSlice[0]
      if (type === 'genre') {
        return `<a href="${item['genre_url']}">${item['genre_name']}</a>`
      } else if (type === 'artist') {
        return `<a href="${item['url']}">${item['name']}</a>`
      } else if (type === 'book') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }

    const allButLast = dataSlice.slice(0, -1).map(item => {
      if (type === 'genre') {
        return `<a href="${item['genre_url']}">${item['genre_name']}</a>`
      } else if (type === 'artist') {
        return `<a href="${item['url']}">${item['name']}</a>`
      } else if (type === 'book') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }).join(', ')

    let last
    const lastItem = dataSlice[dataSlice.length - 1]

    if (type === 'genre') {
      last = `<a href="${lastItem['genre_url']}">${lastItem['genre_name']}</a>`
    } else if (type === 'artist') {
      last = `<a href="${lastItem['url']}">${lastItem['name']}</a>`
    } else if (type === 'book') {
      last = `<a href="${lastItem['url']}">${lastItem['title']}</a>`
    }

    return `${allButLast} and ${last}`
  }
}