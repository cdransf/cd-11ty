import { DateTime } from 'luxon'
import { shuffleArray } from '../utilities/index.js'

export default {
  featuredWatching: (watching, count) => {
    const data = [...watching]
    return shuffleArray(data).slice(0, count)
  },
  normalizeMedia: (media, limit) => {
    const mediaData = limit ? media.slice(0, limit) : media
    return mediaData.map((item) => {
      let normalized = {
        title: item['title'],
        image: item['image'],
        url: item['url'],
        type: item['type']
      }

      switch (item['type']) {
        case 'artist':
          normalized.alt = `${item['plays']} plays of ${item['title']}`
          normalized.subtext = `${item['plays']} plays`
          break
        case 'album':
          normalized.alt = `${item['title']} by ${item['artist']}`
          normalized.subtext = `${item['artist']}`
          break
        case 'album-release':
          normalized.alt = `${item['title']} by ${item['artist']['name']}`
          normalized.subtext = `${item['artist']['name']} / ${item['date']}`
          break
        case 'movie':
          normalized.alt = item['title']
          normalized.rating = item['rating']
          normalized.favorite = item['favorite']
          normalized.subtext = item.rating ? `${item['rating']} (${item['year']})` : `(${item['year']})`
          break
        case 'book':
          normalized.title = `${item['title']} by ${item['author']}`
          if (item['rating']) {
            normalized.rating = item['rating']
            normalized.subtext = item['rating']
          }
          break
        case 'tv':
          normalized.alt = item['formatted_episode']
          normalized.subtext = item['formatted_episode']
          break
      }

      return normalized
    })
  },
  calculatePlayPercentage: (plays, mostPlayed) => `${plays/mostPlayed * 100}%`,
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
      if (type === 'genre' || type === 'artist') {
        return `<a href="${item['url']}">${item['name']}</a>`
      } else if (type === 'book') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }

    const allButLast = dataSlice.slice(0, -1).map(item => {
      if (type === 'genre' || type === 'artist') {
        return `<a href="${item['url']}">${item['name']}</a>`
      } else if (type === 'book') {
        return `<a href="${item['url']}">${item['title']}</a>`
      }
    }).join(', ')

    let last
    const lastItem = dataSlice[dataSlice.length - 1]

    if (type === 'genre' || type === 'artist') {
      last = `<a href="${lastItem['url']}">${lastItem['name']}</a>`
    } else if (type === 'book') {
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