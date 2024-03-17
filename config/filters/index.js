import { DateTime } from 'luxon'
import markdownIt from 'markdown-it'
import { URL } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const metaData = require('../../src/_data/json/meta.json')

const utmPattern = /[?&](utm_[^&=]+=[^&#]*)/gi
const BASE_URL = 'https://coryd.dev'

export default {
  // general
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
  replaceQuotes: (string) => string.replace(/"/g, "'"),

  // analytics
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

  // tags
  tagLookup: (url, tagMap) => {
    if (!url) return
    if (url.includes('thestorygraph.com')) return '#Books #NowReading #TheStoryGraph'
    if (url.includes('trakt.tv')) return '#Movies #Watching #Trakt'
    return tagMap[url] || ''
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
  isoDateOnly: (date, separator) => {
    let d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join(separator)
  },
  stringToDate: (string) => {
    if (!string) return
    return new Date(string)
  },
  oldPost: (date) => {
    return DateTime.now().diff(DateTime.fromJSDate(new Date(date)), 'years').years > 3;
  },
  stringToRFC822Date: (dateString) => {
    const addLeadingZero = (num) => {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    const dayStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timeStamp = Date.parse(dateString);
    const date = new Date(timeStamp);
    const day = dayStrings[date.getDay()];
    const dayNumber = addLeadingZero(date.getDate());
    const month = monthStrings[date.getMonth()];
    const year = date.getFullYear();
    const time = `${addLeadingZero(date.getHours())}:${addLeadingZero(date.getMinutes())}:00`;
    const timezone = date.getTimezoneOffset() === 0 ? "GMT" : "PT";

    return `${day}, ${dayNumber} ${month} ${year} ${time} ${timezone}`;
  },

  // links
  findPost: (url, posts) => {
    if (!url || !posts || !posts[url]?.toots?.[0]?.includes('https')) return null;
    const BASE_URL = 'https://social.lol/users/cory/statuses/'
    const STATUS_URL = 'https://social.lol/@cory/'
    return posts[url]?.toots?.[0]?.replace(BASE_URL, STATUS_URL) || null;
  },
  absoluteUrl: (url, base) => {
    if (!base) base = metaData.url
    try {
      return (new URL(url, base)).toString()
    } catch(e) {}
    return url;
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

    // tags
  filterTags: (tags) => {
    return tags.filter((tag) => tag.toLowerCase() !== 'posts')
  },
  formatTag: (string) => {
    const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1)
    const normalizedString = string.toLowerCase()
    if (
      normalizedString === 'ios' ||
      normalizedString === 'macos' ||
      normalizedString === 'rss'
    ) return `#${string}`
    if (!string.includes(' ')) return `#${capitalizeFirstLetter(string)}`
    return `#${string.split(' ').map(s => capitalizeFirstLetter(s)).join('')}`
  }
}