import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function () {
  const today = DateTime.utc().toISO()
  const { data, error } = await supabase
    .from('albums')
    .select(`
       name,
       key,
       image,
       release_date,
       release_link,
       artists (name_string, mbid, country)
    `)
    .gt('release_date', today)

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  return data.map(album => {
    return {
      artist: album['artists']['name_string'],
      title: album['name'],
      date: DateTime.fromISO(album['release_date']).toLocaleString(DateTime.DATE_FULL),
      url: album['release_link'],
      image: album['image'],
      artist_url: `/music/artists/${sanitizeMediaString(album['artists']['name_string'])}-${sanitizeMediaString(parseCountryField(album['artists']['country']))}`,
      mbid: album['artists']['mbid'],
      timestamp: DateTime.fromISO(album['release_date']).toSeconds(),
      type: 'album-release'
    }
  }).sort((a, b) => a.timestamp - b.timestamp)
}
