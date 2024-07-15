import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 1000

const fetchTagsForBook = async (bookId) => {
  const { data, error } = await supabase
    .from('books_tags')
    .select('tags(id, name)')
    .eq('books_id', bookId)

  if (error) {
    console.error(`Error fetching tags for book ${bookId}:`, error)
    return []
  }

  return data.map(bt => bt.tags.name)
}

async function fetchAllBooks() {
  let books = []
  let from = 0
  let to = PAGE_SIZE - 1

  while (true) {
    const { data, error } = await supabase
      .from('books')
      .select(`*, art(filename_disk)`)
      .range(from, to)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      break
    }

    for (const book of data) {
      book.tags = await fetchTagsForBook(book['id'])
    }

    books = books.concat(data)

    if (data.length < PAGE_SIZE) break

    from += PAGE_SIZE
    to += PAGE_SIZE
  }

  return books
}

export default async function () {
  const books = await fetchAllBooks()

  return books.map(book => ({
      title: book['title'],
      author: book['author'] || '',
      review: book['review'],
      rating: book['star_rating'] !== 'unrated' ? book['star_rating'] : '',
      description: book['description'],
      image: `/${book?.['art']?.['filename_disk']}`,
      url: `/books/${book['isbn']}`,
      date: book['date_finished'],
      status: book['read_status'],
      progress: book['progress'],
      tags: book['tags'],
      isbn: book['isbn'],
      type: 'book',
    }))
}