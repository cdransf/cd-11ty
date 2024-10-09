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
      artist_name,
      artist_description,
      artist_total_plays,
      artist_country,
      artist_favorite
    `)

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  const all = data.map(album => {
    const releaseDate = DateTime.fromISO(album['release_date']).toUTC().startOf('day')

    return {
      artist: {
        name: album['artist_name'],
        description: album['artist_description'],
        total_plays: album['artist_total_plays'],
        country: album['artist_country'],
        favorite: album['artist_favorite'],
        url: album['artist_url'],
      },
      title: album['name'],
      date: releaseDate.toLocaleString(DateTime.DATE_FULL),
      description: album['artist_description'],
      url: album['release_link'],
      image: album['art'] ? `/${album['art']}` : '',
      total_plays: album['total_plays'],
      release_date: releaseDate,
      type: 'album-release',
      timestamp: releaseDate.toSeconds(),
    }
  }).sort((a, b) => a['timestamp'] - b['timestamp'])

  const upcoming = all.filter(album => (!album['total_plays'] || album['total_plays'] <= 0) && album['release_date'] > today)
  const current = all.filter(album => album['release_date'] <= today)

  return { all, upcoming, current }
}

export default async function () {
  try {
    return await fetchAlbumReleases()
  } catch (error) {
    console.error('Error fetching and processing album releases:', error)
    return []
  }
}