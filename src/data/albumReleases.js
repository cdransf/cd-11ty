import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAlbumReleases = async () => {
  const today = DateTime.utc().startOf('day')
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

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  const all = data.map(album => {
    const releaseDate = DateTime.fromISO(album['release_date']).toUTC().startOf('day')

    return {
      artist: album['artist_name'],
      title: album['name'],
      date: releaseDate.toLocaleString(DateTime.DATE_FULL),
      url: album['release_link'],
      image: album['art'] ? `/${album['art']}` : '',
      total_plays: album['total_plays'],
      release_date: releaseDate,
      type: 'album-release',
      timestamp: releaseDate.toSeconds(),
    }
  }).sort((a, b) => a['timestamp'] - b['timestamp'])
  const upcoming = all.filter(album => (!album['total_plays'] || album['total_plays'] <= 0) && album['release_date'] > today);

  return { all, upcoming }
}

export default async function () {
  try {
    return await fetchAlbumReleases()
  } catch (error) {
    console.error('Error fetching and processing album releases:', error)
    return []
  }
}