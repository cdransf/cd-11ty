import { createClient } from '@supabase/supabase-js'
import { parseCountryField } from './utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
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

export default async function () {
  const artists = await fetchPaginatedData('artists', 'mbid, name_string, image, genre, total_plays, country, description, favorite')
  const albums = await fetchPaginatedData('albums', 'mbid, name, release_year, artist_mbid, total_plays')

  const albumsByArtist = albums.reduce((acc, album) => {
    if (!acc[album.artist_mbid]) acc[album.artist_mbid] = []
    acc[album.artist_mbid].push({
      id: album.id,
      name: album.name,
      release_year: album.release_year,
      total_plays: album.total_plays > 0 ? album.total_plays : '-'
    })
    return acc
  }, {})

  artists.forEach(artist => {
    artist.albums = albumsByArtist[artist.mbid]?.sort((a, b) => a['release_year'] - b['release_year']) || []
    artist.country = parseCountryField(artist.country)
  })

  return artists
}