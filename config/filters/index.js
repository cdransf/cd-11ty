import { DateTime } from 'luxon'
import { URL } from 'url'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import sanitizeHtml from 'sanitize-html'
import { shuffleArray, sanitizeMediaString } from '../utilities/index.js'

const BASE_URL = 'https://coryd.dev'

export default {
  // general
  encodeAmp: (string) => {
    if (!string) return
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  formatNumber: (number) => number.toLocaleString('en-US'),
  shuffleArray,
  sanitizeMediaString,
  sanitizeHtml: (html) => sanitizeHtml(html, {
    textFilter: (text) => text.replace(/"/g, '')
  }),

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
  normalizeEntries: (entries, limit) => {
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
    const entryData = limit ? entries.slice(0, limit) : entries

    entryData.forEach((entry) => {
      const md = mdGenerator()
      const dateKey = Object.keys(entry).find(key => key.includes('date'))
      let { title, image, url, slug, link, authors, description, type, content, backdrop, rating, tags } = entry
      const feedNote = '<hr/><p>This is a full text feed, but not all content can be rendered perfectly within the feed. If something looks off, feel free to <a href="https://coryd.dev">visit my site</a> for the original post.</p>'
      const processedEntry = { title: title.trim(), date: new Date(entry[dateKey]), content: description }

      if (url?.includes('http')) processedEntry['url'] = url
      if (!url?.includes('http')) processedEntry['url'] = new URL(url, BASE_URL).toString()
      if (slug) processedEntry['url'] = new URL(slug, BASE_URL).toString()
      if (link) {
        processedEntry['title'] = `${title} via ${authors['name']}`
        processedEntry['url'] = link,
        processedEntry['author'] = {
          name: authors['name'],
          url: authors['url'],
          mastodon: authors?.['mastodon'] || '',
          rss: authors?.['rss_feed'] || ''
        }
      }
      if (description) processedEntry['excerpt'] = description
      if (['book', 'movie', 'link'].includes(type)) processedEntry['excerpt'] = sanitizeHtml(`${md.render(description)}`)
      if (slug && content) processedEntry['excerpt'] = sanitizeHtml(`${md.render(content)}${feedNote}`, {
        disallowedTagsMode: 'completelyDiscard'
      })

      processedEntry['image'] = backdrop || image

      if (rating) processedEntry['rating'] = rating
      if (tags) processedEntry['tags'] = tags
      if (type === 'album-release') {
        processedEntry['excerpt'] = 'Check out the new release!'
        processedEntry['content'] = 'Check out the new release!'
      }

      if (entry) posts.push(processedEntry)
    })

    return posts
  },

  // media
  normalizeMedia: (media, limit) => {
    const mediaData = limit ? media.slice(0, limit) : media
    return mediaData.map((item) => {
      let normalized = {
        image: item['image'],
        url: item['url'],
        type: item['type']
      }
      if (item['type'] === 'artist') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['plays']} plays of ${item['title']}`
        normalized['subtext'] = `${item['plays']} plays`
      }
      if (item['type'] === 'album') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = `${item['artist']}`
      }
      if (item['type'] === 'album-release') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = `${item['artist']} / ${item['date']}`
      }
      if (item['type'] === 'movie') {
        normalized['title'] = item['title']
        normalized['alt'] = item['title']
        normalized['rating'] = item['rating']
        normalized['favorite'] = item['favorite']
        normalized['subtext'] = item.rating ? `${item['rating']} (${item['year']})` : `(${item['year']})`
      }
      if (item['type'] === 'book') {
        normalized['title'] = `${item['title']} by ${item['author']}`
        normalized['rating'] = item['rating']
        if (item['rating']) normalized['subtext'] = item['rating']
      }
      if (item['type'] === 'tv') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} of ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      if (item['type'] === 'tv-range') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      return normalized
    })
  },
  calculatePlayPercentage: (plays, mostPlayed) => `${plays/mostPlayed * 100}%`,
  bookStatus: (books, status) => books.filter(book => book.status === status),
  bookFavorites: (books) => books.filter(book => book.favorite === true),
  bookYearLinks: (years) => years.sort((a, b) => b.value - a.value).map((year, index) => {
    const separator = index < years.length - 1 ? ' / ' : '';
    return `<a href="/books/years/${year.value}">${year.value}</a>${separator}`;
  }).join(''),
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
    if (!data || !type) return ''

    const dataSlice = data.slice(0, count)

    if (dataSlice.length === 0) return null
    if (dataSlice.length === 1) {
      const item = dataSlice[0]
      if (type === 'genre') {
        return `<a href="/music/genres/${sanitizeMediaString(item)}">${item}</a>`
      } else if (type === 'artist') {
        return `<a href="/music/artists/${sanitizeMediaString(item['name_string'])}-${sanitizeMediaString(item['country'].toLowerCase())}">${item['name_string']}</a>`
      } else if (type === 'book') {
        return `<a href="/books/${item['isbn']}">${item['title']}</a>`
      } else if (type === 'movie') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }

    const allButLast = dataSlice.slice(0, -1).map(item => {
      if (type === 'genre') {
        return `<a href="/music/genres/${sanitizeMediaString(item)}">${item}</a>`
      } else if (type === 'artist') {
        return `<a href="/music/artists/${sanitizeMediaString(item['name_string'])}-${sanitizeMediaString(item['country'].toLowerCase())}">${item['name_string']}</a>`
      } else if (type === 'book') {
        return `<a href="/books/${item['isbn']}">${item['title']}</a>`
      } else if (type === 'movie') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }).join(', ')

    let last
    const lastItem = dataSlice[dataSlice.length - 1]

    if (type === 'genre') {
      last = `<a href="/music/genres/${sanitizeMediaString(lastItem)}">${lastItem}</a>`
    } else if (type === 'artist') {
      last = `<a href="/music/artists/${sanitizeMediaString(lastItem['name_string'])}-${sanitizeMediaString(lastItem['country'].toLowerCase())}">${lastItem['name_string']}</a>`
    } else if (type === 'book') {
      last = `<a href="/books/${lastItem['isbn']}">${lastItem['title']}</a>`
    } else if (type === 'movie') {
      last = `<a href="${lastItem['url']}">${lastItem['title']}</a>`
    }
    return `${allButLast} and ${last}`
  },
  formatVenue: (venue) => venue.split(',')[0].trim(),
  lastWatchedEpisode: (episodes) => {
    if (!episodes.length) return
    const sortedEpisodes = episodes.sort((a, b) => new Date(a.last_watched_at) - new Date(b.last_watched_at))
    return `S${sortedEpisodes[sortedEpisodes.length - 1]['season_number']}E${sortedEpisodes[sortedEpisodes.length - 1]['episode_number']}`
  }
}