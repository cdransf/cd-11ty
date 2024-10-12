import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function fetchSearchIndex() {
  const { data, error } = await supabase
    .from('optimized_search_index')
    .select('search_index')

  if (error) {
    console.error('Error fetching search index data:', error)
    return []
  }

  const [{ search_index } = {}] = data
  return search_index || []
}