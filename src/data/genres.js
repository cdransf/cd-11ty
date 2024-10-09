import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchGenresWithArtists = async () => {
  const { data, error } = await supabase
    .from('optimized_genres')
    .select(`
      name,
      description,
      total_plays,
      wiki_link,
      url,
      artists,
      books,
      movies,
      posts
    `)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching genres with artists:', error)
    return []
  }

  return data.map(genre => ({
    ...genre,
    artists: genre['artists'],
    url: genre['url'],
    books: genre['books'] ? genre['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    movies: genre['movies'] ? genre['movies'].map(movie => ({
      title: movie['title'],
      year: movie['year'],
      url: `/watching/movies/${movie['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    posts: genre['posts'] ? genre['posts'].map(post => ({
      title: post['title'],
      date: post['date'],
      url: post['url'],
    })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
  }))
}

export default async function () {
  try {
    return await fetchGenresWithArtists()
  } catch (error) {
    console.error('Error fetching and processing genres:', error)
    return []
  }
}