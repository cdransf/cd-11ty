const markdownIt = require('markdown-it')

const { URL } = require('url')
const BASE_URL = 'https://coryd.dev'

module.exports = {
  normalizeEntries: (entries) => {
    const md = markdownIt({ html: true, linkify: true })
    const posts = []
    entries.forEach((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('date'))
      const date = new Date(entry[dateKey])
      let excerpt = ''

      // set the entry excerpt
      if (entry.description) excerpt = entry.description
      if (entry.data?.post_excerpt) excerpt = md.render(entry.data.post_excerpt)

      // if there's a valid entry return a normalized object
      if (entry && !entry.data?.link) {
        posts.push({
          title: entry.data?.title || entry.title,
          url: entry.url.includes('http') ? entry.url : new URL(entry.url, BASE_URL).toString(),
          content: entry.description,
          date,
          excerpt,
        })
      }
    })
    return posts
  },
}
