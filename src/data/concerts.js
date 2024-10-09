import { createClient } from '@supabase/supabase-js'

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
        artist,
        venue,
        concert_notes
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
    artist: concert['artist'] && typeof concert['artist'] === 'object' ? {
      name: concert['artist'].name,
      url: concert['artist'].url
    } : { name: concert['artist'], url: null },
    venue: concert['venue'] && typeof concert['venue'] === 'object' ? {
      name: concert['venue'].name,
      latitude: concert['venue'].latitude,
      longitude: concert['venue'].longitude,
      notes: concert['venue'].notes
    } : null,
    description: 'I went to (yet another) concert!',
    notes: concert['concert_notes'],
    url: `/music/concerts?id=${concert['id']}`,
    artistUrl: concert['artist'] && typeof concert['artist'] === 'object' ? concert['artist'].url : null
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