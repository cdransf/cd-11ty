import { createClient } from '@supabase/supabase-js'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

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
        mbid,
        name_string,
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
    id: artist['id'],
    mbid: artist['mbid'],
    name: artist['name_string'],
    tentative: artist['tentative'],
    totalPlays: artist['total_plays'],
    country: parseCountryField(artist['country']),
    description: artist['description'],
    favorite: artist['favorite'],
    genre: artist['genre'],
    emoji: artist['emoji'],
    tattoo: artist['tattoo'],
    image: artist['art'] ? `/${artist['art']}` : '',
    url: `/music/artists/${sanitizeMediaString(artist['name_string'])}-${sanitizeMediaString(parseCountryField(artist['country']))}`,
    albums: (artist['albums'] || []).map(album => ({
      id: album['id'],
      name: album['name'],
      releaseYear: album['release_year'],
      totalPlays: album['total_plays'],
      art: album.art ? `/${album['art']}` : ''
    })).sort((a, b) => a['release_year'] - b['release_year']),
    concerts: artist['concerts']?.[0]?.['id'] ? artist['concerts'].sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
    books: artist['books']?.[0]?.['id'] ? artist['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      isbn: book['isbn'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null,
    movies: artist['movies']?.[0]?.['id'] ? artist['movies'].map(movie => ({
      title: movie['title'],
      year: movie['year'],
      tmdb_id: movie['tmdb_id'],
      url: `/watching/movies/${movie['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    shows: artist['shows']?.[0]?.['id'] ? artist['shows'].map(show => ({
      title: show['title'],
      year: show['year'],
      tmdb_id: show['tmdb_id'],
      url: `/watching/shows/${show['tmdb_id']}`,
    })).sort((a, b) => b['year'] - a['year']) : null,
    posts: artist['posts']?.[0]?.['id'] ? artist['posts'].map(post => ({
      id: post['id'],
      title: post['title'],
      date: post['date'],
      slug: post['slug'],
      url: post['slug'],
    })).sort((a, b) => new Date(b['date']) - new Date(a['date'])) : null,
    relatedArtists: artist['related_artists']?.[0]?.['id'] ? artist['related_artists'].map(relatedArtist => {
      relatedArtist['url'] = `/music/artists/${sanitizeMediaString(relatedArtist['name'])}-${sanitizeMediaString(parseCountryField(relatedArtist['country']))}`
      return relatedArtist
    }).sort((a, b) => a['name'].localeCompare(b['name'])) : null,
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