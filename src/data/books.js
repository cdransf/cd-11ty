import { createClient } from '@supabase/supabase-js'

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
        tattoo,
        tags,
        artists,
        genres,
        movies,
        posts,
        shows,
        related_books
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
      tattoo: book['tattoo'],
      description: book['description'],
      image: `/${book['art']}`,
      url: `/books/${book['isbn']}`,
      date: book['date_finished'],
      status: book['read_status'],
      progress: book['progress'],
      tags: Array.isArray(book['tags']) ? book['tags'] : book['tags']?.split(',') || [],
      type: 'book',
      artists: book['artists'] ? book['artists'].sort((a, b) => a['name'].localeCompare(b['name'])) : null,
      movies: book['movies'] ? book['movies'].map(movie => {
        movie['url'] = `/watching/movies/${movie['tmdb_id']}`
        return movie
      }).sort((a, b) => b['year'] - a['year']) : null,
      genres: book['genres'] ? book['genres'].sort((a, b) => a['name'].localeCompare(b['name'])) : null,
      shows: book['shows'] ? book['shows'].map(show => {
        show['url'] = `/watching/shows/${show['tmdb_id']}`
        return show
      }).sort((a, b) => b['year'] - a['year']) : null,
      posts: book['posts'] ? book['posts'].map(post => ({
        title: post['title'],
        date: post['date'],
        url: post['url'],
      })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
      relatedBooks: book['related_books'] ? book['related_books'].map(relatedBook => ({
        title: relatedBook['title'],
        author: relatedBook['author'],
        description: relatedBook['description'],
        url: `/books/${relatedBook['isbn']}`,
      })).sort((a, b) => a['title'].localeCompare(b['title'])) : null, // Add related books processing
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