const { URL } = require('url')
const BASE_URL = 'https://coryd.dev'

module.exports = {
  normalizeEntries: (entries) => {
    return entries.map((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('date'))
      const date = new Date(entry[dateKey])
      let excerpt = ''

      // set the entry excerpt
      if (entry.data?.post_excerpt) excerpt = entry.data.post_excerpt
      if (entry.description) excerpt = entry.description

      // if there's a valid entry return a normalized object
      if (entry) {
        return {
          title: entry.data?.title || entry.title,
          url: entry.url.includes('http') ? entry.url : new URL(entry.url, BASE_URL).toString(),
          date,
          excerpt,
        }
      }
    })
  },
}
