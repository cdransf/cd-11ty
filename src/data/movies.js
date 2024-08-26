import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import slugify from 'slugify'
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
        tattoo,
        star_rating,
        description,
        review,
        art,
        backdrop,
        tags,
        artists,
        books,
        genres,
        shows,
        posts,
        related_movies
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
    tattoo: item['tattoo'],
    rating: item['star_rating'],
    review: item['review'],
    id: item['tmdb_id'],
    type: 'movie',
    tags: item['tags'] ? item['tags'].split(',') : [],
    artists: item['artists']?.[0]?.['id'] ? item['artists'].map(artist => {
      artist['url'] = `/music/artists/${sanitizeMediaString(artist['name'])}-${sanitizeMediaString(parseCountryField(artist['country']))}`
      return artist
    }).sort((a, b) => a['name'].localeCompare(b['name'])) : null,
    books: item['books']?.[0]?.['id'] ? item['books'].map(book => {
      book['url'] = `/books/${book['isbn']}`
      return book
    }).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    genres: item['genres']?.[0]?.['id'] ? item['genres'].map(genre => {
      genre['url'] = `/music/genres/${slugify(genre['name'].replace('/', '-').toLowerCase())}`
      return genre
    }).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    shows: item['shows']?.[0]?.['id'] ? item['shows'].map(show => {
      show['url'] = `/watching/shows/${show['tmdb_id']}`
      return show
    }).sort((a, b) => b['year'] - a['year']) : null,
    posts: item['posts']?.[0]?.['id'] ? item['posts'].map(post => ({
      id: post['id'],
      title: post['title'],
      date: post['date'],
      slug: post['slug'],
      url: post['slug'],
    })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
    relatedMovies: item['related_movies']?.[0]?.['id'] ? item['related_movies'].map(movie => {
      movie['url'] = `/watching/movies/${movie['tmdb_id']}`
      return movie
    }).sort((a, b) => b['year'] - a['year']) : null,
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
    const recentlyWatchedMovies = filterMovies(movie => movie['lastWatched'] && year - DateTime.fromISO(movie['lastWatched']).year <= 3).sort((a, b) => new Date(b['lastWatched']) - new Date(a['lastWatched']))

    return {
      movies: formatMovieData(processedMovies),
      watchHistory: formatMovieData(filterMovies(movie => movie['lastWatched'])),
      recentlyWatched: formatMovieData(recentlyWatchedMovies),
      favorites: formatMovieData(favoriteMovies).sort((a, b) => a['title'].localeCompare(b['title'])),
    }
  } catch (error) {
    console.error('Error fetching and processing movies data:', error)
    return {
      movies: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: [],
    }
  }
}