import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAlbumReleases = async () => {
  const today = DateTime.utc().toISO()
  const { data, error } = await supabase
    .from('optimized_album_releases')
    .select(`
      name,
      key,
      release_date,
      release_link,
      total_plays,
      art,
      artist_name,
      artist_mbid,
      artist_country
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
      artist_url: `/music/artists/${sanitizeMediaString(album['artist_name'])}-${sanitizeMediaString(parseCountryField(album['artist_country']))}`,
      mbid: album['artist_mbid'],
      timestamp: DateTime.fromISO(album['release_date']).toSeconds(),
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