import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAlbumReleases = async () => {
  const today = DateTime.utc().toISO()
  const { data, error } = await supabase
    .from('optimized_album_releases')
    .select(`
      name,
      release_date,
      release_link,
      total_plays,
      art,
      artist_name
    `)
    .gt('release_date', today)

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  return data
    .filter(album => !album['total_plays'] || album['total_plays'] <= 0)
    .map(album => ({
      artist: album['artist_name'],
      title: album['name'],
      date: DateTime.fromISO(album['release_date']).toLocaleString(DateTime.DATE_FULL),
      url: album['release_link'],
      image: album['art'] ? `/${album['art']}` : '',
      type: 'album-release'
    }))
    .sort((a, b) => a['timestamp'] - b['timestamp'])
}

export default async function () {
  try {
    return await fetchAlbumReleases()
  } catch (error) {
    console.error('Error fetching and processing album releases:', error)
    return []
  }
}