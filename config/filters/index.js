import { DateTime } from 'luxon'
import { URL } from 'url'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import sanitizeHtml from 'sanitize-html';

import { shuffleArray, sanitizeMediaString } from '../utilities/index.js'

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
  replaceQuotes: (string) => string.replace(/"/g, "'"),
  formatNumber: (number) => number.toLocaleString('en-US'),
  shuffleArray,

  // navigation
  isLinkActive: (category, page) => page.includes(category) && page.split('/').filter(a => a !== '').length <= 1,

  // posts
  filterByPostType: (posts, postType) => {
    if (postType === 'featured') return shuffleArray(posts.filter(post => post.featured === true)).slice(0, 3)
    return posts.slice(0, 5)
  },

  // watching
  featuredWatching: (watching, count) => {
    const data = [...watching]
    return shuffleArray(data).slice(0, count)
  },

  // dates
  isoDateOnly: (date, separator) => {
    let d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join(separator)
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
  absoluteUrl: (url) => (new URL(url, BASE_URL)).toString(),

  // feeds
  normalizeEntries: (entries) => {
    const posts = []
    const mdGenerator = () => {
      const md = markdownIt({ html: true, linkify: true })

      md.use(markdownItAnchor, {
        level: [1, 2],
        permalink: markdownItAnchor.permalink.headerLink({
          safariReaderFix: true
        })
      })
      md.use(markdownItFootnote)
      md.renderer.rules.footnote_ref = (tokens, idx) => {
        const id = tokens[idx].meta.id + 1
        return `<sup>${id}</sup>`
      }
      md.renderer.rules.footnote_block_open = () => (
        '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n'
      )
      md.renderer.rules.footnote_open = (tokens, idx) => {
        const id = tokens[idx].meta.id + 1
        return `<li id="fn${id}" class="footnote-item"> `
      }
      md.renderer.rules.footnote_anchor = () => ''

      return md
    }

    entries.forEach((entry) => {
      const dateKey = Object.keys(entry).find(key => key.includes('date'))
      const date = new Date(entry[dateKey])
      const md = mdGenerator()
      let excerpt = ''
      let url = ''
      let title = entry.title
      const feedNote = '<hr/><p>This is a full text feed, but not all content can be rendered perfectly within the feed. If something looks off, feel free to <a href="https://coryd.dev">visit my site</a> for the original post.</p>'

      if (entry.url?.includes('http')) url = entry.url
      if (!entry.url?.includes('http')) url = new URL(entry.url, BASE_URL).toString()
      if (entry?.slug) url = new URL(entry.slug, BASE_URL).toString()
      if (entry?.link) {
        title = `${entry.title} via ${entry.authors.name}`
        url = entry.link
      }
      if (entry.description) excerpt = entry.description
      if (entry.type === 'book' || entry.type === 'movie' || entry.type === 'link') excerpt = `${entry.description}<br/><br/>`
      if (entry?.slug && entry.content) excerpt = sanitizeHtml(`${md.render(entry.content)}${feedNote}`, {
        disallowedTagsMode: 'completelyDiscard'
      })

      if (entry) posts.push({
        title: title.trim(),
        url,
        content: entry.description,
        date,
        excerpt,
        rating: entry?.rating || ''
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
        type: item.type
      }
      if (item.type === 'artists') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['plays']} plays of ${item['title']}`
        normalized['subtext'] = `${item['plays']} plays`
      }
      if (item.type === 'albums') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = `${item['artist']}`
      }
      if (item.type === 'album-release') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = `${item['artist']} / ${item['date']}`
      }
      if (item.type === 'movie') {
        normalized['title'] = item['title']
        normalized['alt'] = item['title']
        normalized['rating'] = item['rating']
        normalized['favorite'] = item['favorite']
        normalized['subtext'] = item['rating']
      }
      if (item.type === 'book') {
        normalized['title'] = `${item['title']} by ${item['author']}`
        normalized['rating'] = item['rating']
        if (item['rating']) normalized['subtext'] = item['rating']
      }
      if (item.type === 'tv') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} of ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      if (item.type === 'tv-range') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      return normalized
    }),
  calculatePlayPercentage: (plays, mostPlayed) => `${plays/mostPlayed * 100}%`,
  listToString: (items, key, count = 10) => {
    const itemData = items.slice(0, count)
    if (itemData.length === 0) return ''
    if (itemData.length === 1) return itemData[0][key]
    const allButLast = itemData.slice(0, -1).map(item => item[key]).join(', ')
    const last = itemData[itemData.length - 1][key]
    return `${allButLast} and ${last}`
  },
  bookStatus: (books, status) => books.filter(book => book.status === status),
  bookSortDescending: (books) => books.filter(book => !isNaN(DateTime.fromISO(book.date).toMillis())).sort((a, b) => {
    const dateA = DateTime.fromISO(a.date)
    const dateB = DateTime.fromISO(b.date)
    return dateB - dateA
  }),
  bookFinishedYear: (books, year) => books.filter(book => {
    if (book.status === 'finished' && book.date) return parseInt(book.date.split('-')[0]) === year
    return ''
  }),
  currentBookCount: (books) => {
    const year = DateTime.now().year
    return books.filter(book => {
      if (book.status === 'finished' && book.date) return parseInt(book.date.split('-')[0]) === year
      return ''
    }).length
  },
  getLastWatched: (show) => show?.['episodes'][show['episodes']?.length - 1]?.['last_watched_at'],
  sortByPlaysDescending: (data, key) => data.sort((a, b) => b[key] - a[key]),
  genreStrings: (genres, key) => genres.map(genre => genre[key]),
  mediaLinks: (data, type, count = 10) => {
    const dataSlice = data.slice(0, count)
    if (dataSlice.length === 0) return ''
    if (dataSlice.length === 1) return type === 'genre' ? dataSlice[0] : dataSlice[0]['artist_name']

    const allButLast = dataSlice.slice(0, -1).map(item => {
      if (type === 'genre') {
        return `<a href="/music/genres/${sanitizeMediaString(item)}">${item}</a>`
      } else if (type === 'artist') {
        return `<a href="/music/artists/${sanitizeMediaString(item['name_string'])}-${sanitizeMediaString(item['country'].toLowerCase())}">${item['name_string']}</a>`
      }
    }).join(', ')

    const last = type === 'genre'
      ? `<a href="/music/genres/${sanitizeMediaString(dataSlice[dataSlice.length - 1])}">${dataSlice[dataSlice.length - 1]}</a>`
      : `<a href="/music/artists/${sanitizeMediaString(dataSlice[dataSlice.length - 1]['name_string'])}-${sanitizeMediaString(dataSlice[dataSlice.length - 1]['country'].toLowerCase())}">${dataSlice[dataSlice.length - 1]['name_string']}</a>`

    return `${allButLast} and ${last}`
  }
}