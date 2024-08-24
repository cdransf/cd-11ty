import { createClient } from '@supabase/supabase-js'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllBooks = async () => {
  let books = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_books')
      .select(`
        id,
        isbn,
        date_finished,
        author,
        description,
        title,
        progress,
        read_status,
        star_rating,
        review,
        art,
        favorite,
        tags,
        artists,
        movies
      `)
      .order('date_finished', { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      break
    }

    books = books.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return books
}

const processBooks = (books) => {
  return books.map(book => {
    const dateFinished = new Date(book['date_finished'])
    const year = dateFinished.getUTCFullYear()

    return {
      title: book['title'],
      author: book['author'] || '',
      review: book['review'],
      rating: book['star_rating'] !== 'unrated' ? book['star_rating'] : '',
      favorite: book['favorite'],
      description: book['description'],
      image: `/${book['art']}`,
      url: `/books/${book['isbn']}`,
      date: book['date_finished'],
      status: book['read_status'],
      progress: book['progress'],
      tags: Array.isArray(book['tags']) ? book['tags'] : book['tags']?.split(',') || [], // Ensure tags is an array
      isbn: book['isbn'],
      type: 'book',
      artists: book['artists']?.[0]?.['id'] ? book['artists'].map(artist => {
        artist['url'] = `/music/artists/${sanitizeMediaString(artist['name'])}-${sanitizeMediaString(parseCountryField(artist['country']))}`
        return artist
      }).sort((a, b) => a['name'].localeCompare(b['name'])) : null,
      movies: book['movies']?.[0]?.['id'] ? book['movies'].map(movie => {
        movie['url'] =`/watching/movies/${movie['tmdb_id']}`
        return movie
      }).sort((a, b) => b['year'] - a['year']) : null,
      year,
    }
  })
}

const sortBooksByYear = (books) => {
  const years = {}
  books.forEach(book => {
    const year = book['year']
    if (!years[year]) {
      years[year] = { value: year, data: [book] }
    } else {
      years[year]['data'].push(book)
    }
  })
  return Object.values(years).filter(year => year.value > 2017)
}

export default async function () {
  const books = await fetchAllBooks()
  const processedBooks = processBooks(books)
  return { all: processedBooks, years: sortBooksByYear(processedBooks) }
}