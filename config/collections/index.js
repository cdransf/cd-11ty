import { DateTime } from 'luxon'
import slugify from 'slugify'

const BASE_URL = 'https://coryd.dev'

const tagsToHashtags = (tags) => {
  const hashtags = tags.map(tag => {
    const words = tag.split(' ')
    const hashtag = words.map(word => {
      const normalizedWord = word.toLowerCase()
      const wordMap = {
        'ai': 'AI',
        'css': 'CSS',
        'ios': 'iOS',
        'javascript': 'JavaScript',
        'macos': 'macOS'
      }
      if (wordMap[normalizedWord]) return wordMap[normalizedWord]
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join('')
    return '#' + hashtag
  })
  return hashtags.join(' ');
}

export const searchIndex = (collection) => {
  const searchIndex = []
  let id = 0
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { posts, links, movies, books } = data
  const movieData = movies['movies'].filter(movie => (movie['review']?.length && movie['review']?.length > 0 && movie['rating']))
  const bookData = books.filter(book => (book['review']?.length && book['review']?.length > 0 && book['rating']))
  const addItemToIndex = (items, icon, getUrl, getTitle, getTags) => {
    if (items) {
      items.forEach((item) => {
        searchIndex.push({
          id,
          url: getUrl(item),
          title: `${icon}: ${getTitle(item)}`,
          tags: getTags ? getTags(item) : [],
        })
        id++
      })
    }
  }

  addItemToIndex(posts, '📝', item => new URL(item['slug'], BASE_URL).toString(), item => item['title'], item => item['tags'])
  addItemToIndex(links, '🔗', item => item['link'], item => item['title'], item => item['tags'])
  if (movieData) addItemToIndex(movieData, '🎥', item => item['url'], item => `${item['title']} (${item['rating']})`, item => item['tags'])
  if (bookData) addItemToIndex(bookData, '📖', item => item['url'], item => `${item['title']} (${item['rating']})`, item => item['tags'])

  return searchIndex
}

export const allContent = (collection) => {
  const aggregateContent = []
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const {
    posts,
    links,
    books,
    movies: { movies }
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
          url: `${BASE_URL}${item['url']}`,
          title: `${icon}: ${getTitle(item)}${item?.['authors']?.['name'] ? ' via ' + item['authors']['name'] : ''}${item?.['tags']?.length > 0 ? ' ' + tagsToHashtags(item['tags']) : ''}`
        }
        if (item?.['link']) content['url'] = item?.['link']
        if (item?.['slug']) content['url'] = new URL(item['slug'], BASE_URL).toString()
        if (item?.['description']) content['description'] = `${item['description']}<br/><br/>`
        const date = getDate ? parseDate(getDate(item)) : null
        if (date) content['date'] = date
        aggregateContent.push(content)
      })
    }
  }

  addContent(posts, '📝', item => item['title'], item => item['date'])
  addContent(links, '🔗', item => item['title'], item => item['date'])
  addContent(books.filter(book => book['status'] === 'finished'), '📖', item => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, item => item['date'])
  addContent(movies, '🎥', item => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, item => item['lastWatched'])

  return aggregateContent.sort((a, b) => {
    const dateA = a['date'] ? DateTime.fromISO(a['date']) : DateTime.fromMillis(0)
    const dateB = b['date'] ? DateTime.fromISO(b['date']) : DateTime.fromMillis(0)
    return dateB - dateA
  })
}

export const popularPosts = (collection) => {
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { posts, analytics } = data

  return posts
    .filter((post) => {
      if (analytics.find((p) => p.page.includes(post.slug))) return true
    })
    .sort((a, b) => {
      const visitors = (page) => analytics.filter((p) => p.page.includes(page.slug)).pop()?.visitors
      return visitors(b) - visitors(a)
    })
}