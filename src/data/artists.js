import { createClient } from '@supabase/supabase-js'
import { parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllArtists = async () => {
  let artists = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_artists')
      .select(`
        id,
        name_string,
        url,
        tentative,
        total_plays,
        country,
        description,
        favorite,
        genre,
        emoji,
        tattoo,
        art,
        albums,
        concerts,
        books,
        movies,
        posts,
        related_artists,
        shows
      `)
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching artists:', error)
      break
    }

    artists = artists.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return artists
}

const processArtists = (artists) => {
  return artists.map(artist => ({
    name: artist['name_string'],
    tentative: artist['tentative'],
    totalPlays: artist['total_plays'],
    country: parseCountryField(artist['country']),
    description: artist['description'],
    favorite: artist['favorite'],
    genre: {
      name: artist['genre']['name'],
      url: artist['genre']['url'],
    },
    emoji: artist['emoji'],
    tattoo: artist['tattoo'],
    image: artist['art'] ? `/${artist['art']}` : '',
    url: artist['url'],
    albums: (artist['albums'] || []).map(album => ({
      name: album['name'],
      releaseYear: album['release_year'],
      totalPlays: album['total_plays'],
      art: album.art ? `/${album['art']}` : ''
    })).sort((a, b) => a['release_year'] - b['release_year']),
    concerts: artist['concerts'] ? artist['concerts'].sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
    books: artist['books'] ? artist['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    movies: artist['movies'] ? artist['movies'].map(movie => ({
      title: movie['title'],
      year: movie['year'],
      url: `/watching/movies/${movie['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    shows: artist['shows'] ? artist['shows'].map(show => ({
      title: show['title'],
      year: show['year'],
      url: `/watching/shows/${show['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    posts: artist['posts'] ? artist['posts'].map(post => ({
      title: post['title'],
      date: post['date'],
      url: post['url'],
    })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
    relatedArtists: artist['related_artists'] ? artist['related_artists'].sort((a, b) => a['name'].localeCompare(b['name'])) : null,
  }))
}

export default async function () {
  try {
    const artists = await fetchAllArtists()
    return processArtists(artists)
  } catch (error) {
    console.error('Error fetching and processing artists data:', error)
    return []
  }
}