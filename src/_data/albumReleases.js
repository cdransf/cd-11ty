import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const deriveArtistName = (albumName, key) => {
  const normalizedAlbumName = albumName.toLowerCase().replace(/[\s.]+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (key.endsWith(normalizedAlbumName)) {
    const artistName = key.slice(0, key.length - normalizedAlbumName.length).replace(/-$/, '')
    const formattedArtistName = artistName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    return formattedArtistName
  } else {
    return ''
  }
}

export default async function () {
  const today = DateTime.utc().toISO()
  const { data, error } = await supabase
    .from('albums')
    .select(`
       name,
       key,
       image,
       release_date,
       release_link
    `)
    .gt('release_date', today)

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  return data.map(album => {
    return {
      artist: deriveArtistName(album['name'], album['key']),
      title: album['name'],
      date: DateTime.fromISO(album['release_date']).toLocaleString(DateTime.DATE_FULL),
      url: album['release_link']
    }
  })
}
