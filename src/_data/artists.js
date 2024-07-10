import { createClient } from '@supabase/supabase-js'
import { parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 50

const fetchPaginatedData = async (table, selectFields) => {
  let data = []
  let page = 0
  let hasMoreRecords = true

  while (hasMoreRecords) {
    const { data: pageData, error } = await supabase
      .from(table)
      .select(selectFields)
      .order('id', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      break
    }

    data = data.concat(pageData)

    if (pageData.length < PAGE_SIZE) {
      hasMoreRecords = false
    } else {
      page++
    }
  }

  return data
}

const fetchGenreMapping = async () => {
  const { data, error } = await supabase
    .from('genres')
    .select('id, name')

  if (error) {
    console.error('Error fetching genres:', error)
    return {}
  }

  return data.reduce((acc, genre) => {
    acc[genre.id] = genre.name
    return acc
  }, {})
}

export default async function () {
  const genreMapping = await fetchGenreMapping()
  const artists = await fetchPaginatedData('artists', 'id, mbid, name_string, art(filename_disk), total_plays, country, description, favorite, tattoo, genres')
  const albums = await fetchPaginatedData('albums', 'mbid, name, release_year, total_plays, artist')
  const albumsByArtist = albums.reduce((acc, album) => {
    if (!acc[album.artist]) acc[album.artist] = []
    acc[album.artist].push({
      id: album.id,
      name: album.name,
      release_year: album.release_year,
      total_plays: album.total_plays > 0 ? album.total_plays : '-'
    })
    return acc
  }, {})

  for (const artist of artists) {
    artist.albums = albumsByArtist[artist['id']]?.sort((a, b) => a['release_year'] - b['release_year']) || []
    artist.image = `/${artist['art']['filename_disk']}`
    artist.country = parseCountryField(artist['country'])
    artist.genres = genreMapping[artist['genres']] || ''
  }

  return artists
}