import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllMovies = async () => {
  let movies = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_movies')
      .select(`
        id,
        tmdb_id,
        last_watched,
        title,
        year,
        collected,
        plays,
        favorite,
        star_rating,
        description,
        review,
        art,
        backdrop,
        tags,
        artists
      `)
      .order('last_watched', { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

    movies = movies.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return movies
}

const processMovies = (movies) => {
  return movies.map(item => ({
    title: item['title'],
    lastWatched: item['last_watched'],
    dateAdded: item['last_watched'],
    year: item['year'],
    url: `/watching/movies/${item['tmdb_id']}`,
    description: item['description'],
    image: item['art'] ? `/${item['art']}` : '',
    backdrop: item['backdrop'] ? `/${item['backdrop']}` : '',
    plays: item['plays'],
    collected: item['collected'],
    favorite: item['favorite'],
    rating: item['star_rating'],
    review: item['review'],
    id: item['tmdb_id'],
    type: 'movie',
    tags: item['tags'] ? item['tags'].split(',') : [],
    artists: item['artists']?.[0]?.['id'] ? item['artists'].map(artist => {
      artist['url'] = `/music/artists/${sanitizeMediaString(artist['name'])}-${sanitizeMediaString(parseCountryField(artist['country']))}`
      return artist
    }).sort((a, b) => a['name'].localeCompare(b['name'])) : null,
  }))
}

export default async function () {
  const year = DateTime.now().year

  try {
    const movies = await fetchAllMovies()
    const processedMovies = processMovies(movies)

    const filterMovies = (condition) => processedMovies.filter(condition)
    const formatMovieData = (movies) => movies.map(movie => movie)

    const favoriteMovies = filterMovies(movie => movie['favorite'])
    const collectedMovies = filterMovies(movie => movie['collected'])
    const recentlyWatchedMovies = filterMovies(movie => movie['lastWatched'] && year - DateTime.fromISO(movie['lastWatched']).year <= 3).sort((a, b) => new Date(b['lastWatched']) - new Date(a['lastWatched']))

    return {
      movies: formatMovieData(processedMovies),
      watchHistory: formatMovieData(filterMovies(movie => movie['lastWatched'])),
      recentlyWatched: formatMovieData(recentlyWatchedMovies),
      favorites: formatMovieData(favoriteMovies).sort((a, b) => a['title'].localeCompare(b['title'])),
      collection: formatMovieData(collectedMovies),
    }
  } catch (error) {
    console.error('Error fetching and processing movies data:', error)
    return {
      movies: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: [],
      collection: [],
    }
  }
}