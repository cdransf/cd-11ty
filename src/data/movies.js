import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

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
      .select('*')
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching movies:', error)
      break
    }

    movies = movies.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return movies
}

export default async function () {
  const year = DateTime.now().year

  try {
    const movies = await fetchAllMovies()
    const filterMovies = (condition) => movies.filter(condition)
    const favoriteMovies = filterMovies(movie => movie.favorite)
    const recentlyWatchedMovies = filterMovies(movie => movie.last_watched && year - DateTime.fromISO(movie.last_watched).year <= 3)

    return {
      movies,
      watchHistory: filterMovies(movie => movie.last_watched),
      recentlyWatched: recentlyWatchedMovies,
      favorites: favoriteMovies.sort((a, b) => a.title.localeCompare(b.title)),
    }
  } catch (error) {
    console.error('Error fetching and processing movies data:', error)
    return {
      movies: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: []
    }
  }
}