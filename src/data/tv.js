import { createClient } from '@supabase/supabase-js'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllShows = async () => {
  let shows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_shows')
      .select(`
        id,
        tmdb_id,
        last_watched_at,
        title,
        year,
        collected,
        favorite,
        tattoo,
        description,
        review,
        art,
        backdrop,
        tags,
        episodes,
        artists,
        books,
        movies,
        posts,
        related_shows
      `)
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching shows:', error)
      break
    }

    shows = shows.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return shows
}

const prepareShowData = (show) => ({
  ...show,
  image: show['art'] ? `/${show['art']}` : '',
  backdrop: show['backdrop'] ? `/${show['backdrop']}` : '',
  url: `/watching/shows/${show['tmdb_id']}`,
  episodes: show['episodes'] || [],
  tattoo: show['tattoo'],
  tags: Array.isArray(show['tags']) ? show['tags'] : show['tags']?.split(',') || [],
  movies: show['movies']?.[0]?.['id'] ? show['movies'].map(movie => {
    movie['url'] = `/watching/movies/${movie['tmdb_id']}`
    return movie
  }).sort((a, b) => b['year'] - a['year']) : null,
  books: show['books']?.[0]?.['id'] ? show['books'].map(book => ({
    title: book['title'],
    author: book['author'],
    isbn: book['isbn'],
    description: book['description'],
    url: `/books/${book['isbn']}`,
  })).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
  posts: show['posts']?.[0]?.['id'] ? show['posts'].map(post => ({
    id: post['id'],
    title: post['title'],
    date: post['date'],
    slug: post['slug'],
    url: post['slug'],
  })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
  relatedShows: show['related_shows']?.[0]?.['id'] ? show['related_shows'].map(relatedShow => ({
    id: relatedShow['id'],
    title: relatedShow['title'],
    year: relatedShow['year'],
    tmdb_id: relatedShow['tmdb_id'],
    url: `/watching/shows/${relatedShow['tmdb_id']}`,
  })).sort((a, b) => b['year'] - a['year']) : null,
  artists: show['artists']?.[0]?.['id'] ? show['artists'].map(artist => {
    artist['url'] = `/music/artists/${sanitizeMediaString(artist['name'])}-${sanitizeMediaString(parseCountryField(artist['country']))}`
    return artist
  }).sort((a, b) => a['name'].localeCompare(b['name'])) : null, // Add artists processing
})

const prepareEpisodeData = (show) => show['episodes'].map(episode => ({
  ...episode,
  show_title: show['title'],
  show_tmdb_id: show['tmdb_id'],
  show_year: show['year'],
  collected: show['collected'],
  favorite: show['favorite'],
  image: show['image'],
  backdrop: show['backdrop'],
  episode_number: episode['episode_number'] || 0,
  season_number: episode['season_number'] || 0,
  last_watched_at: episode['last_watched_at'] || '1970-01-01T00:00:00Z'
}))

const formatEpisodeData = (episodes) => {
  const showEpisodesMap = {}

  episodes.forEach(episode => {
    const showTmdbId = episode['show_tmdb_id']
    const showYear = episode['show_year']

    if (!showEpisodesMap[showTmdbId]) {
      showEpisodesMap[showTmdbId] = {
        title: episode['show_title'],
        tmdbId: showTmdbId,
        year: showYear,
        collected: episode['collected'],
        favorite: episode['favorite'],
        dateAdded: episode['last_watched_at'],
        lastWatchedAt: episode['last_watched_at'],
        episodes: [],
        image: episode['image'],
        backdrop: episode['backdrop'],
      }
    }

    showEpisodesMap[showTmdbId].episodes.push({
      name: episode['show_title'],
      url: `/watching/shows/${showTmdbId}`,
      subtext: `S${episode['season_number']}E${episode['episode_number']}`,
      episode: episode['episode_number'],
      season: episode['season_number'],
      tmdbId: showTmdbId,
      year: showYear,
      type: 'tv',
      dateAdded: episode['last_watched_at'],
      lastWatchedAt: episode['last_watched_at'],
      image: episode['image'],
      backdrop: episode['backdrop'],
    })
  })

  return Object.values(showEpisodesMap).sort((a, b) => new Date(b['episodes'][0]['lastWatchedAt']) - new Date(a['episodes'][0]['lastWatchedAt'])).flatMap(show => {
    const startingEpisode = show['episodes'][show['episodes'].length - 1]['episode']
    const startingSeason = show['episodes'][show['episodes'].length - 1]['season']
    const endingEpisode = show['episodes'][0]['episode']
    const endingSeason = show['episodes'][0]['season']

    if (show.episodes.length > 1) {
      return {
        name: show['title'],
        url: `/watching/shows/${show['tmdbId']}`,
        subtext: `S${startingSeason}E${startingEpisode} - S${endingSeason}E${endingEpisode}`,
        startingEpisode,
        startingSeason,
        episode: endingEpisode,
        season: endingSeason,
        tmdbId: show['tmdbId'],
        year: show['year'],
        collected: show['collected'],
        favorite: show['favorite'],
        type: 'tv-range',
        image: show['image'],
        backdrop: show['backdrop'],
      }
    } else {
      return show['episodes'][0]
    }
  })
}

export default async function () {
  try {
    const rawShows = await fetchAllShows()
    const shows = rawShows.map(prepareShowData)
    const episodes = shows.flatMap(prepareEpisodeData).sort((a, b) => new Date(b['last_watched_at']) - new Date(a['last_watched_at']))
    const favoriteShows = shows.filter(show => show.favorite)

    return {
      shows,
      watchHistory: formatEpisodeData(episodes),
      recentlyWatched: formatEpisodeData(episodes.slice(0, 225)),
      favorites: formatEpisodeData(favoriteShows.flatMap(prepareEpisodeData)).sort((a, b) => a['name'].localeCompare(b['name'])),
    }
  } catch (error) {
    console.error('Error fetching and processing shows data:', error)
    return {
      shows: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: [],
    }
  }
}