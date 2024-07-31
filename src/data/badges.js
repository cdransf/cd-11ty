import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAllBadges = async () => {
  const { data, error } = await supabase
    .from('badges')
    .select(`
      *,
      image(filename_disk)
    `)

  if (error) {
    console.error('Error fetching badge data:', error)
    return []
  }

  const transformedData = data.map(badge => ({
    ...badge,
    image: badge.image?.filename_disk || '',
  })).sort((a, b) => a.sort - b.sort)

  return transformedData
}

export default async function () {
  try {
    return await fetchAllBadges()
  } catch (error) {
    console.error('Error fetching and processing badge data:', error)
    return []
  }
}