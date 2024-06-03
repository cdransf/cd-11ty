import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function fetchGenresWithArtists() {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('blogroll', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching authors with for the blogroll:', error)
    return []
  }

  return data
}