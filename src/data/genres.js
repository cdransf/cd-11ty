import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'
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

  return data.map(genre => ({
    ...genre,
    artists: genre['artists'].map(artist => ({
      ...artist,
      country: parseCountryField(artist['country'])
    })),
    url: `/music/genres/${slugify(genre['name'].replace('/', '-').toLowerCase())}`
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