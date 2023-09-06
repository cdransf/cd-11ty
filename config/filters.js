const marked = require('marked')
const sanitizeHTML = require('sanitize-html')
const utmPattern = /[?&](utm_[^&=]+=[^&#]*)/gi

module.exports = {
  trim: (string, limit) => {
    return string.length <= limit ? string : `${string.slice(0, limit)}...`
  },
  stripIndex: (path) => {
    return path.replace('/index.html', '/')
  },
  mdToHtml: (content) => {
    return marked.parse(content)
  },
  dashLower: (string) => string.replace(/\s+/g, '-').toLowerCase(),
  encodeAmp: (string) => {
    if (!string) return
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  stripUtm: (string) => {
    if (!string) return
    return string.replace(utmPattern, '')
  },
  normalizeEntries: (entries) => {
    return entries.map((entry) => {
      let excerpt = ''
      let date = ''

      // set the entry excerpt
      if (entry.data?.post_excerpt) excerpt = entry.data.post_excerpt
      if (entry.description) excerpt = entry.description

      // set the entry date
      if (entry.date) date = entry.date
      if (entry.dateAdded) date = entry.dateAdded
      if (entry.date_published) date = entry.date_published

      // if there's a valid entry return a normalized object
      if (entry) {
        return {
          title: entry.data?.title || entry.title,
          url: entry.url.includes('http') ? entry.url : `https://coryd.dev${entry.url}`,
          date,
          excerpt,
        }
      }
    })
  },
  getPostImage: (image) => {
    if (image && image !== '') return image
    return 'https://coryd.dev/assets/img/social-card.jpg'
  },
  getPopularPosts: (posts, analytics) => {
    return posts
      .filter((post) => {
        if (analytics.find((p) => p.url.includes(post.url))) return true
      })
      .sort((a, b) => {
        const visitors = (page) => analytics.filter((p) => p.url.includes(page.url)).pop().rank
        return visitors(b) - visitors(a)
      })
  },
  webmentionsByUrl: (webmentions, url) => {
    const allowedTypes = ['mention-of', 'in-reply-to', 'like-of', 'repost-of']

    const data = {
      'like-of': [],
      'repost-of': [],
      'in-reply-to': [],
    }

    const hasRequiredFields = (entry) => {
      const { author, published, content } = entry
      return author.name && published && content
    }

    const filtered =
      webmentions
        .filter((entry) => entry['wm-target'].replace(utmPattern, '') === `https://coryd.dev${url}`)
        .filter((entry) => allowedTypes.includes(entry['wm-property'])) || []

    filtered.forEach((m) => {
      if (data[m['wm-property']]) {
        const isReply = m['wm-property'] === 'in-reply-to'
        const isValidReply = isReply && hasRequiredFields(m)
        if (isReply) {
          if (isValidReply) {
            m.sanitized = sanitizeHTML(m.content.html)
            data[m['wm-property']].unshift(m)
          }
          return
        }

        data[m['wm-property']].unshift(m)
      }
    })

    data['in-reply-to'].sort((a, b) =>
      a.published > b.published ? 1 : b.published > a.published ? -1 : 0
    )

    return data
  },
}
