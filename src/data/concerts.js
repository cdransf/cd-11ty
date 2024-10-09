import { createClient } from '@supabase/supabase-js'
import { parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllConcerts = async () => {
  let concerts = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_concerts')
      .select(`
        id,
        date,
        artist_name_string,
        venue,
        concert_notes,
        artist,
        venue_name,
        latitude,
        longitude,
        bounding_box,
        venue_notes,
        artist_name,
        artist_country
      `)
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching concerts:', error)
      break
    }

    concerts = concerts.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return concerts
}

const processConcerts = (concerts) => {
  return concerts.map(concert => ({
    id: concert['id'],
    type: 'concert',
    date: concert['date'],
    artistNameString: concert['artist_name_string'],
    venue: {
      name: concert['venue_name'],
      latitude: concert['latitude'],
      longitude: concert['longitude'],
      boundingBox: concert['bounding_box'],
      notes: concert['venue_notes']
    },
    description: 'I went to (yet another) concert!',
    notes: concert['concert_notes'],
    artist: concert['artist'] ? {
      name: concert['artist_name'],
    } : null,
    url: `/music/concerts?id=${concert['id']}`,
    artistUrl: concert['artist'] ? concert['artist_url'] : null
  })).sort((a, b) => new Date(b['date']) - new Date(a['date']))
}

export default async function () {
  try {
    const concerts = await fetchAllConcerts()
    return processConcerts(concerts)
  } catch (error) {
    console.error('Error fetching and processing concerts data:', error)
    return []
  }
}