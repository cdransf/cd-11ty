import { createClient } from '@supabase/supabase-js'
import { parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchGenresWithArtists = async () => {
  const { data, error } = await supabase
    .from('genres')
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
      )
    `)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching genres with artists:', error)
    return []
  }

  data.forEach(genre => {
    genre['artists'] = genre['artists'].map(artist => ({
      ...artist,
      country: parseCountryField(artist['country'])
    }))
  })

  return data
}

export default async function () {
  return await fetchGenresWithArtists()
}