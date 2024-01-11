import { DateTime } from 'luxon'
import markdownIt from 'markdown-it'
import { URL } from 'url'
import sanitizeHTML from 'sanitize-html'

const utmPattern = /[?&](utm_[^&=]+=[^&#]*)/gi
const BASE_URL = 'https://coryd.dev'

export default {
  // general
  trim: (string, limit) => {
    return string.length <= limit ? string : `${string.slice(0, limit)}...`
  },
  btoa: (string) => {
    return btoa(string)
  },
  encodeAmp: (string) => {
    if (!string) return
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  splitLines: (input, maxCharLength) => {
    const parts = input.split(' ')
    const lines = parts.reduce(function (acc, cur) {
      if (!acc.length) return [cur]
      let lastOne = acc[acc.length - 1]
      if (lastOne.length + cur.length > maxCharLength) return [...acc, cur]
      acc[acc.length - 1] = lastOne + ' ' + cur
      return acc
    }, [])
    return lines
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
        if (analytics.find((p) => p.page === post.url)) return true
      })
      .sort((a, b) => {
        const visitors = (page) => analytics.filter((p) => p.page === page.url).pop().visitors
        return visitors(b) - visitors(a)
      })
  },
  tagLookup: (url, tagMap) => {
    if (!url) return
    if (url.includes('thestorygraph.com')) return '#Books #NowReading #TheStoryGraph'
    if (url.includes('trakt.tv')) return '#Movies #Watching #Trakt'
    return tagMap[url] || ''
  },
  webmentionsByUrl: (webmentions, url) => {
    if (!webmentions) return null;

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

    // delete empty keys
    Object.keys(data).forEach((key) => {
      if (data[key].length === 0) delete data[key]
    });

    if (!Object.keys(data).length) return null;

    return data
  },

  // dates
  readableDate: (date) => {
    return DateTime.fromISO(date).toFormat('LLLL d, yyyy')
  },
  dateToReadableDate: (date) => {
    return new Date(date)
      .toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      })
      .split(',')[0]
  },
  isoDateOnly: (date) => {
    let d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [month, day, year].join('.')
  },
  stringToDate: (string) => {
    if (!string) return
    return new Date(string)
  },
  oldPost: (date) => {
    return DateTime.now().diff(DateTime.fromJSDate(new Date(date)), 'years').years > 3;
  },

  // links
  findPost: (url, posts) => {
    if (!url || !posts) return null;
    return posts[url]?.toots?.[0] || null;
  },

  // feeds
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
      if (entry)
        posts.push({
          title: entry.data?.title || entry.title,
          url: entry.url.includes('http') ? entry.url : new URL(entry.url, BASE_URL).toString(),
          content: entry.description,
          date,
          excerpt,
        })
    })
    return posts
  },

  // media
  normalizeMedia: (media) =>
    media.map((item) => {
      let normalized = {
        image: item['image'],
        url: item['url'],
      }
      if (item.type === 'album') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = `${item['artist']}`
      }
      if (item.type === 'artist') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['plays']} plays of ${item['title']}`
        normalized['subtext'] = `${item['plays']} plays`
      }
      if (item.type === 'movie') normalized['alt'] = item['title']
      if (item.type === 'book') {
        normalized['alt'] = `${item['title']} by ${item['author']}`
        normalized['subtext'] = `${item['percentage']} finished`
        normalized['percentage'] = item['percentage']
      }
      if (item.type === 'tv') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      if (item.type === 'tv-range') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      return normalized
    }),
}
