const marked = require('marked')
const sanitizeHTML = require('sanitize-html')

const utmPattern = /[?&](utm_[^&=]+=[^&#]*)/gi
const BASE_URL = 'https://coryd.dev'

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
  btoa: (string) => {
    return btoa(string)
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
  getPostImage: (image) => {
    if (image && image !== '') return image
    return `${BASE_URL}/assets/img/social-card.jpg`
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
  tagLookup: (url, tagMap) => {
    if (!url) return
    if (url.includes('https://goodreads.com')) return '#Books #Reading'
    if (url.includes('https://trakt.tv')) return '#Movies #Trakt'
    return tagMap[url] || ''
  },
  webmentionsByUrl: (webmentions, url) => {
    const allowedTypes = ['mention-of', 'in-reply-to', 'like-of', 'repost-of']

    const data = {
      'like-of': [],
      'repost-of': [],
      'in-reply-to': [],
      'mention-of': [],
      'link-to': [],
    }

    const hasRequiredReplyFields = (entry) => {
      const { author, published, content } = entry
      return author.name && author.photo && published && content
    }

    const hasRequiredMentionFields = (entry) => {
      const { name, url } = entry
      return name && url
    }

    const filtered =
      webmentions
        .filter((entry) => entry['wm-target'] === `${BASE_URL}${url}`)
        .filter((entry) => allowedTypes.includes(entry['wm-property'])) || []

    filtered.forEach((m) => {
      if (data[m['wm-property']]) {
        const isReply = m['wm-property'] === 'in-reply-to'
        const isMention = m['wm-property'] === 'mention-of'
        const isValidReply = (isReply || isMention) && hasRequiredReplyFields(m)
        if (isReply || isMention) {
          if (isValidReply) {
            m.sanitized = sanitizeHTML(m.content.html)
            data[m['wm-property']].unshift(m)
          }

          if (isMention && hasRequiredMentionFields(m)) data['link-to'].push(m)
          return
        }
        data[m['wm-property']].unshift(m)
      }
    })

    data['in-reply-to'] = [...data['in-reply-to'], ...data['mention-of']]
    data['in-reply-to'].sort((a, b) =>
      a.published > b.published ? 1 : b.published > a.published ? -1 : 0
    )

    return data
  },
}
