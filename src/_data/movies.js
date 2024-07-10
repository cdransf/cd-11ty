import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchTagsForMovie = async (movieId) => {
  const { data, error } = await supabase
    .from('movies_tags')
    .select('tags(id, name)')
    .eq('movies_id', movieId)

  if (error) {
    console.error(`Error fetching tags for movie ${movieId}:`, error)
    return []
  }

  return data.map(mt => mt.tags.name)
}

const fetchAllMovies = async () => {
  let movies = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('movies')
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
        art(filename_disk),
        backdrop(filename_disk)
      `)
      .order('last_watched', { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

    for (const movie of data) {
      movie.tags = await fetchTagsForMovie(movie.id)
    }

    movies = movies.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return movies
}

export default async function () {
  const year = DateTime.now().year
  const movies = await fetchAllMovies()
  const formatMovieData = (movies, watched = true) => movies.map((item) => {
    const movie = {
      title: item['title'],
      lastWatched: item['last_watched'],
      dateAdded: item['last_watched'],
      year: item['year'],
      url: `/watching/movies/${item['tmdb_id']}`,
      description: `${item['title']} (${item['year']})<br/>Watched at: ${DateTime.fromISO(item['last_watched'], { zone: 'utc' }).setZone('America/Los_Angeles').toFormat('MMMM d, yyyy, h:mma')}`,
      image: `/${item?.['art']?.['filename_disk']}`,
      backdrop: `/${item?.['backdrop']?.['filename_disk']}`,
      plays: item['plays'],
      collected: item['collected'],
      favorite: item['favorite'],
      rating: item['star_rating'],
      description: item['description'],
      review: item['review'],
      id: item['tmdb_id'],
      type: 'movie',
      tags: item['tags']
    }

    return movie
  }).filter(movie => watched ? movie['lastWatched'] : !movie['lastWatched'])
  const favoriteMovies = movies.filter(movie => movie['favorite'])
  const collectedMovies = movies.filter(movie => movie['collected'])
  const recentlyWatchedMovies = movies.filter(movie => movie['last_watched'] && year - DateTime.fromISO(movie['last_watched']).year <= 3).sort((a, b) => new Date(b['last_watched']) - new Date(a['last_watched']))

  return {
    movies: [...formatMovieData(movies), ...formatMovieData(movies, false)],
    watchHistory: formatMovieData(movies),
    recentlyWatched: formatMovieData(recentlyWatchedMovies),
    favorites: formatMovieData(favoriteMovies).sort((a, b) => a['title'].localeCompare(b['title'])),
    collection: formatMovieData(collectedMovies),
  }
}