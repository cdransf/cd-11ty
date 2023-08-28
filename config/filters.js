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
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  stripUtm: (string) => {
    return string.replace(utmPattern, '')
  },
  getPostImage: (image) => {
    if (image && image !== '') return image
    return '/assets/img/social-card.webp'
  },
  getPopularPosts: (posts, analytics) => {
    return posts
      .filter((post) => {
        if (analytics.find((p) => p.url.includes(post.url))) return true
      })
      .sort((a, b) => {
        const visitors = (page) => analytics.filter((p) => p.url.includes(page.url)).pop().value
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
