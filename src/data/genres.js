import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'
import { parseCountryField } from '../../config/utilities/index.js'

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
      artists (
        mbid,
        name_string,
        total_plays,
        country,
        description,
        favorite
      ),
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
    artists: genre['artists'].map(artist => ({
      ...artist,
      country: parseCountryField(artist['country'])
    })),
    url: `/music/genres/${slugify(genre['name'].replace('/', '-').toLowerCase())}`,
    books: genre['books']?.[0]?.['id'] ? genre['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      isbn: book['isbn'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    movies: genre['movies']?.[0]?.['id'] ? genre['movies'].map(movie => ({
      title: movie['title'],
      year: movie['year'],
      tmdb_id: movie['tmdb_id'],
      url: `/watching/movies/${movie['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    posts: genre['posts']?.[0]?.['id'] ? genre['posts'].map(post => ({
      id: post['id'],
      title: post['title'],
      date: post['date'],
      slug: post['slug'],
      url: post['slug'],
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