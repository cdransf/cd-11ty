import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAlbumReleases = async () => {
  const today = DateTime.utc().toISO()
  const { data, error } = await supabase
    .from('albums')
    .select(`
      name,
      key,
      release_date,
      release_link,
      total_plays,
      art(filename_disk),
      artists(name_string, mbid, country)
    `)
    .gt('release_date', today)

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  return data.filter(album => !album['total_plays'] || !album['total_plays'] > 0).map(album => ({
      artist: album['artists']['name_string'],
      title: album['name'],
      date: DateTime.fromISO(album['release_date']).toLocaleString(DateTime.DATE_FULL),
      url: album['release_link'],
      image: `/${album?.['art']?.['filename_disk']}` || '',
      artist_url: `/music/artists/${sanitizeMediaString(album['artists']['name_string'])}-${sanitizeMediaString(parseCountryField(album['artists']['country']))}`,
      mbid: album['artists']['mbid'],
      timestamp: DateTime.fromISO(album['release_date']).toSeconds(),
      type: 'album-release'
    }
  )).sort((a, b) => a.timestamp - b.timestamp)
}

export default async function () {
  return await fetchAlbumReleases()
}
