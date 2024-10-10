import { DateTime } from 'luxon'
import markdownIt from 'markdown-it'
import ics from 'ics'

const BASE_URL = 'https://coryd.dev'
const md = markdownIt()

const normalizeWord = (word) => {
  if (!word) return ''
  const wordMap = {
    'ai': 'AI',
    'css': 'CSS',
    'ios': 'iOS',
    'javascript': 'JavaScript',
    'macos': 'macOS',
    'tv': 'TV'
  }
  return wordMap[word?.toLowerCase()] || word?.charAt(0).toUpperCase() + word.slice(1)
}

const tagsToHashtags = (item) => {
  const tags = item?.['tags'] || []
  if (tags.length) return tags.map(tag => '#' + normalizeWord(tag)).join(' ')
  return ''
}

export const processContent = (collection) => {
  const siteMapContent = []
  const searchIndex = []
  const aggregateContent = []
  let id = 0

  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { posts, links, movies, books, pages, artists, genres, tv, concerts, albumReleases } = data

  const parseDate = (date) => {
    if (!date) return null

    const formats = [
      { method: 'fromISO' },
      { method: 'fromFormat', format: 'yyyy-MM-dd' },
      { method: 'fromFormat', format: 'MM/dd/yyyy' },
      { method: 'fromFormat', format: 'dd-MM-yyyy' }
    ]

    for (const { method, format } of formats) {
      const parsedDate = format
        ? DateTime[method](date, format)
        : DateTime[method](date)

      if (parsedDate.isValid) return parsedDate
    }

    return null
  }

  const absoluteUrl = (url) => new URL(url, BASE_URL).toString()
  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const addSiteMapContent = (items, getTitle, getDate) => {
    const addedUrls = new Set()

    if (items) {
      items.forEach((item) => {
        let url = item?.['permalink'] || item?.['url']

        if (!url || addedUrls.has(url)) return
        if (!isValidUrl(url)) url = absoluteUrl(url)
        if (addedUrls.has(url)) return

        const parsedDate = getDate ? parseDate(getDate(item)) : null
        const formattedDate = parsedDate ? parsedDate.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ") : null
        const content = {
          url,
          title: getTitle(item),
          date: formattedDate
        }

        siteMapContent.push(content)
        addedUrls.add(url)
      })
    }
  }

  const addItemToIndex = (items, icon, getUrl, getTitle, getTags) => {
    if (items) {
      items.forEach((item) => {
        const url = getUrl(item)
        if (!url) return

        const absoluteUrlString = isValidUrl(url) ? url : absoluteUrl(url)
        searchIndex.push({
          id,
          url: absoluteUrlString,
          title: `${icon}: ${getTitle(item)}`,
          tags: getTags ? getTags(item) : []
        })
        id++
      })
    }
  }

  const addContent = (items, icon, getTitle, getDate) => {
    if (items) {
      items.forEach((item) => {
        let attribution = ''
        let hashTags = tagsToHashtags(item) ? ' ' + tagsToHashtags(item) : ''
        if (item['type'] === 'album-release') hashTags = ' #Music #NewMusic'
        if (item['type'] === 'concert') hashTags = ' #Music #Concert'

        if (item?.['author']?.['mastodon']) {
          const mastoUrl = new URL(item['author']['mastodon'])
          attribution = `${mastoUrl.pathname.replace('/', '')}@${mastoUrl.host}`
        } else if (item?.['author']?.['name']) {
          attribution = item['author']['name']
        }

        let url = item['url'] || item['link']
        if (url && !isValidUrl(url)) url = absoluteUrl(url)
        if (item['type'] === 'concert') url = `${item['artist']?.['url'] ? item['artist']['url'] : BASE_URL + '/music/concerts'}?t=${DateTime.fromISO(item['date']).toMillis()}${item['artist']?.['url'] ? '#concerts' : ''}`

        const content = {
          url,
          title: `${icon}: ${getTitle(item)}${attribution ? ' via ' + attribution : ''}${hashTags}`,
          type: item['type']
        }

        if (item['description']) {
          content['description'] = md.render(item['description'])
        } else if (item['notes']) {
          content['notes'] = md.render(item['notes'])
        } else {
          content['description'] = ''
        }

        const date = getDate ? parseDate(getDate(item)) : null
        if (date) content['date'] = date

        aggregateContent.push(content)
      })
    }
  }

  const movieData = movies['movies'].filter((movie) => movie['rating'])
  const showData = tv['shows'].filter((show) => show?.['episode']?.['formatted_episode'])
  const bookData = books['all'].filter((book) => book['rating'])

  addItemToIndex(posts, '📝', (item) => item['url'], (item) => item['title'], (item) => item['tags'])
  addItemToIndex(links, '🔗', (item) => item['link'], (item) => item['title'], (item) => item['tags'])
  addItemToIndex(artists, '🎙️', (item) => item['url'], (item) => `${item['name']} (${item['country']}) - ${item['genre']?.['name']}`, (item) => `['${item['genre']}']`)
  addItemToIndex(genres, '🎵', (item) => item['url'], (item) => item['name'], (item) => item.artists.map(artist => artist['name_string']))
  if (movieData) addItemToIndex(movieData, '🎥', (item) => item['url'], (item) => `${item['title']} (${item['rating']})`, (item) => item['tags'])
  if (showData) addItemToIndex(showData, '📺', (item) => item['url'], (item) => `${item['title']} (${item['year']})`, (item) => item['tags'])
  if (bookData) addItemToIndex(bookData, '📖', (item) => item['url'], (item) => `${item['title']} (${item['rating']})`, (item) => item['tags'])

  addContent(posts, '📝', (item) => item['title'], (item) => item['date'])
  addContent(links, '🔗', (item) => item['title'], (item) => item['date'])
  addContent(books.all.filter((book) => book['status'] === 'finished'), '📖', (item) => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, (item) => item['date'])
  addContent(movies['movies'], '🎥', (item) => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, (item) => item['lastWatched'])
  addContent(concerts, '🎤', (item) => `${item['artistNameString'] ? item['artistNameString'] : item['artist']['name']} at ${item['venue']['name'].split(',')[0].trim()}`, (item) => item['date'])
  addContent([...albumReleases['current']].reverse(), '📆', (item) => `${item['title']} by ${item['artist']['name']}`, (item) => item['release_date'])

  addSiteMapContent(posts, (item) => item['title'], (item) => item['date'])
  addSiteMapContent(pages, (item) => item['title'], (item) => item['date'])
  addSiteMapContent(artists, (item) => item['name'], (item) => item['date'])
  addSiteMapContent(genres, (item) => item['name'], (item) => item['date'])
  addSiteMapContent(movies['movies'], (item) => item['title'], (item) => item['date'])
  addSiteMapContent(books.all, (item) => item['title'], (item) => item['date'])
  addSiteMapContent(tv?.['shows'], (item) => item['title'], (item) => item['date'])

  return {
    searchIndex,
    allContent: aggregateContent.sort((a, b) => {
      const dateA = a['date'] ? DateTime.fromISO(a['date']) : DateTime.fromMillis(0)
      const dateB = b['date'] ? DateTime.fromISO(b['date']) : DateTime.fromMillis(0)
      return dateB - dateA
    }),
    siteMap: siteMapContent.sort((a, b) => {
      const dateA = a['date'] ? DateTime.fromISO(a['date']) : DateTime.fromMillis(0)
      const dateB = b['date'] ? DateTime.fromISO(b['date']) : DateTime.fromMillis(0)
      return dateB - dateA
    })
  }
}

export const albumReleasesCalendar = (collection) => {
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { albumReleases: { all } } = data
  if (!all || all.length === 0) return ''

  const events = all.map(album => {
    const date = DateTime.fromFormat(album['date'], 'MMMM d, yyyy')
    if (!date.isValid) return null

    return {
      start: [date.year, date.month, date.day],
      startInputType: 'local',
      startOutputType: 'local',
      title: `Release: ${album['artist']['name']} - ${album['title']}`,
      description: `Check out this new album release: ${album['url']}. Read more about ${album['artist']['name']} at https://coryd.dev${album['artist']['url']}`,
      url: album['url'],
      uid: `${date.toFormat('yyyyMMdd')}-${album['artist']['name']}-${album['title']}@coryd.dev`,
      timestamp: DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
    }
  }).filter(event => event !== null)

  const { error, value } = ics.createEvents(events, { calName: 'Album releases calendar / coryd.dev' })

  if (error) {
    console.error('Error creating events: ', error)
    events.forEach((event, index) => {
      console.error(`Event ${index}:`, event)
    })
    return ''
  }

  return value
}