import tagAliases from '../data/tag-aliases.js'
import { DateTime } from 'luxon'

export const searchIndex = (collection) => {
  const searchIndex = []
  let id = 0
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { collections: { posts, links } } = data
  const addItemToIndex = (items, icon, getUrl, getTitle, getTags) => {
    if (items) {
      items.forEach((item) => {
        searchIndex.push({
          id,
          url: getUrl(item),
          title: `${icon}: ${getTitle(item)}`,
          tags: getTags(item),
        })
        id++
      })
    }
  }

  addItemToIndex(posts, '📝', item => item.url.includes('http') ? item.url : `https://coryd.dev${item.url}`, item => item.data.title, item => item.data.tags.filter(tag => tag !== 'posts'))
  addItemToIndex(links, '🔗', item => item.data.link, item => item.data.title, item => item.data.tags)

  return searchIndex
}

export const followContent = (collection) => {
  const aggregateContent = []
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const {
    collections: { posts, links },
    books,
    movies: { movies },
    weeklyArtistChart
  } = data
  const parseDate = (date) => {
    if (!date) return null
    let parsedDate = DateTime.fromISO(date)
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd')
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'MM/dd/yyyy')
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'dd-MM-yyyy')
    return parsedDate.isValid ? parsedDate.toISO() : null
  }

  const addContent = (items, icon, getTitle, getDate) => {
    if (items) {
      items.forEach(item => {
        const content = {
          url: item.url.includes('http') ? item.url : `https://coryd.dev${item.url}`,
          title: `${icon}: ${getTitle(item)}`
        }
        if (item.data?.link) content.url = item.data?.link
        const date = getDate ? parseDate(getDate(item)) : null
        if (date) content.date = date
        aggregateContent.push(content)
      })
    }
  }

  addContent(posts, '📝', item => item.data.title, item => item.data.date)
  addContent(links, '🔗', item => item.data.title, item => item.data.date)
  addContent(books.filter(book => book.status === 'started'), '📖', item => item.title, item => item.date)
  addContent(movies, '🎥', item => item.title, item => item.lastWatched)
  addContent(weeklyArtistChart, '🎧', item => item.title, item => item.date)

  return aggregateContent.sort((a, b) => {
    const dateA = a.date ? DateTime.fromISO(a.date) : DateTime.fromMillis(0)
    const dateB = b.date ? DateTime.fromISO(b.date) : DateTime.fromMillis(0)
    return dateB - dateA
  })
}

export const tagList = (collection) => {
  const tagsSet = new Set()
  collection.getAll().forEach((item) => {
    if (!item.data.tags) return
    item.data.tags
      .filter((tag) => !['posts', 'all'].includes(tag))
      .forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

export const tagMap = (collection) => {
  const tags = {}
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { collections: { posts, links }, books } = data
  const processItems = (items, getUrl, getTags) => {
    if (items) {
      items.forEach((item) => {
        const url = getUrl(item)
        const tagString = [...new Set(getTags(item).map(tag => tagAliases[tag.toLowerCase()]))]
          .join(' ')
          .trim()
          .replace(/\s+/g, ' ')
        if (tagString) tags[url] = tagString
      })
    }
  }

  processItems(posts, item => item.url.includes('http') ? item.url : `https://coryd.dev${item.url}`, item => item.data.tags || [])
  processItems(links, item => item.data.link, item => item.data.tags || [])
  processItems(books, item => item.tags || [], item => item.tags || [])

  return tags
}

export const tagsSortedByCount = (collection) => {
  const tagStats = {}
  collection.getFilteredByGlob('src/posts/**/*.*').forEach((item) => {
    if (!item.data.tags) return
    item.data.tags
      .filter((tag) => !['posts', 'all', 'politics', 'net neutrality'].includes(tag))
      .forEach((tag) => {
      if (!tagStats[tag]) tagStats[tag] = 1
      if (tagStats[tag]) tagStats[tag] = tagStats[tag] + 1
    })
  })
  return Object.entries(tagStats).sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key}`)
}

export const links = (collection) => collection.getFilteredByGlob('src/links/**/*.*').reverse()

export const booksToRead = (collection) => collection.getAll()[0].data.books.filter(book => book.status === 'want to read').sort((a, b) => a['title'].toLowerCase().localeCompare(b['title'].toLowerCase()))