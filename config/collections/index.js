import { DateTime } from 'luxon'
import ics from 'ics'

const BASE_URL = 'https://coryd.dev'

const normalizeWord = (word) => {
  const wordMap = {
    'ai': 'AI',
    'css': 'CSS',
    'ios': 'iOS',
    'javascript': 'JavaScript',
    'macos': 'macOS',
    'tv': 'TV'
  }
  return wordMap[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1)
}

const tagsToHashtags = (item) => {
  const tags = item?.tags || []
  if (tags.length) return tags.map(tag => '#' + tag.split(' ').map(normalizeWord).join('')).join(' ')
  return ''
}

export const processContent = (collection) => {
  const searchIndex = []
  const aggregateContent = []
  const siteMapContent = []
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
      { method: 'fromFormat', format: 'dd-MM-yyyy' },
    ]

    for (const { method, format } of formats) {
      const parsedDate = format
        ? DateTime[method](date, format)
        : DateTime[method](date)

      if (parsedDate.isValid) return parsedDate
    }

    return null
  }

  const addSiteMapContent = (items, getTitle, getDate) => {
    const addedUrls = new Set()

    if (items) {
      items.forEach((item) => {
        let url
        if (item?.['url']) url = item['url']
        if (item?.['permalink']) url = item['permalink']
        if (item?.['slug']) url = item['slug']
        if (!url || addedUrls.has(url)) return

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

  const movieData = movies['movies'].filter((movie) => movie['rating'])
  const showData = tv['shows'].filter((show) => show['episodes']?.[0]?.['last_watched_at'])
  const bookData = books.all.filter((book) => book['rating'])

  const addItemToIndex = (items, icon, getUrl, getTitle, getTags) => {
    if (items) {
      items.forEach((item) => {
        searchIndex.push({
          id,
          url: getUrl(item),
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
        let attribution
        let hashTags = tagsToHashtags(item) ? ' ' + tagsToHashtags(item) : ''
        if (item['type'] === 'album-release') hashTags = ' #Music #NewMusic'
        if (item['type'] === 'concert') hashTags = ' #Music #Concert'

        // link attribution if properties exist
        if (item?.['authors']?.['mastodon']) {
          const mastoUrl = new URL(item['authors']['mastodon'])
          attribution = `${mastoUrl.pathname.replace('/', '')}@${mastoUrl.host}`
        } else if (!item?.['authors']?.['mastodon'] && item?.['authors']?.['name']) {
          attribution = item['authors']['name']
        }

        const content = {
          url: !item['url']?.includes('http') ? `${BASE_URL}${item['url']}` : item['url'],
          title: `${icon}: ${getTitle(item)}${attribution ? ' via ' + attribution : ''}${hashTags}`,
          type: item['type']
        }

        // set url for link posts
        if (item?.['link']) content['url'] = item?.['link']

        // set url for posts - identified as slugs here
        if (item?.['slug']) content['url'] = new URL(item['slug'], BASE_URL).toString()

        // set unique concert urls
        if (item?.['type'] === 'concert') content['url'] = `${item['artistUrl']}?t=${DateTime.fromISO(item['date']).toMillis()}#concerts`
        if (item?.['description']) {
          content['description'] = `${item['description'].split(' ').length >= 25 ? item['description'].split(' ').slice(0, 25).join(' ') + '...' : item['description']}`
        } else if (item?.['notes']) {
          content['notes'] = `${item['notes'].split(' ').length >= 25 ? item['description'].split(' ').slice(0, 25).join(' ') + '...' : item['description']}`
        } else {
          content['description'] = ''
        }

        const date = getDate ? parseDate(getDate(item)) : null
        if (date) content['date'] = date
        aggregateContent.push(content)
      })
    }
  }

  addItemToIndex(posts, '📝', (item) => new URL(item['slug'], BASE_URL).toString(), (item) => item['title'], (item) => item['tags'])
  addItemToIndex(links, '🔗', (item) => item['link'], (item) => item['title'], (item) => item['tags'])
  addItemToIndex(artists, '🎙️', (item) => item['url'], (item) => `${item['name']} (${item['country']}) - ${item['genre']}`, (item) => `['${item['genre']}']`)
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

  addSiteMapContent(posts, (item) => item.title, (item) => item.date)
  addSiteMapContent(pages, (item) => item.title, (item) => item.date)
  addSiteMapContent(artists, (item) => item.name, (item) => item.date)
  addSiteMapContent(genres, (item) => item.name, (item) => item.date)
  addSiteMapContent(movies['movies'], (item) => item.title, (item) => item.date)
  addSiteMapContent(books.all, (item) => item.title, (item) => item.date)
  addSiteMapContent(tv?.['shows'], (item) => item.title, (item) => item.date)

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
    const date = DateTime.fromFormat(album.date, 'MMMM d, yyyy')
    if (!date.isValid) return null

    return {
      start: [date.year, date.month, date.day],
      startInputType: 'local',
      startOutputType: 'local',
      title: `Release: ${album['artist']['name']} - ${album['title']}`,
      description: `Check out this new album release: ${album['url']}. Read more about ${album['artist']['name']} at https://coryd.dev${album['artist']['url']}`,
      url: album.url,
      uid: `${date.toFormat('yyyyMMdd')}-${album['artist']['name']}-${album.title}@coryd.dev`,
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