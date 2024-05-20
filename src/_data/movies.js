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
      .from('movies')
      .select(`
        tmdb_id,
        slug,
        last_watched,
        title,
        year,
        collected,
        plays,
        favorite,
        rating
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

export default async function () {
  const movies = await fetchAllMovies()
  const formatMovieData = (movies, watched = true) => movies.map((item) => {
    const movie = {
      title: item['title'],
      lastWatched: item['last_watched'],
      dateAdded: item['last_watched'],
      year: item['year'],
      url: `https://www.themoviedb.org/movie/${item['tmdb_id']}`,
      description: `${item['title']} (${item['year']})<br/>Watched at: ${DateTime.fromISO(item['last_watched'], { zone: 'utc' }).setZone('America/Los_Angeles').toFormat('MMMM d, yyyy, h:mma')}`,
      image: `https://coryd.dev/media/movies/poster-${item['tmdb_id']}.jpg`,
      backdrop: `https://coryd.dev/media/movies/backdrops/backdrop-${item['tmdb_id']}.jpg`,
      plays: item['plays'],
      collected: item['collected'],
      favorite: item['favorite'],
      rating: item['rating'],
      type: 'movie'
    }
    return movie
  }).filter(movie => watched ? movie['lastWatched'] : !movie['lastWatched'])
  const favoriteMovies = movies.filter(movie => movie['favorite'])
  const collectedMovies = movies.filter(movie => movie['collected'])
  const recentlyWatchedMovies = movies.filter(movie => movie['last_watched']).sort((a, b) => new Date(b['last_watched']) - new Date(a['last_watched'])).slice(0, 6)

  return {
    movies: [...formatMovieData(movies), ...formatMovieData(movies, false)],
    watchHistory: formatMovieData(movies),
    recentlyWatched: formatMovieData(recentlyWatchedMovies),
    favorites: formatMovieData(favoriteMovies).sort((a, b) => a['title'].localeCompare(b['title'])),
    collection: formatMovieData(collectedMovies),
    toWatch: formatMovieData(movies, false).sort((a, b) => a['title'].localeCompare(b['title'])),
  }
}