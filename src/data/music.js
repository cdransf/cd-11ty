import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchDataFromView = async (viewName) => {
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .order('listened_at', { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(`Error fetching data from view ${viewName}:`, error)
      break
    }

    if (data.length === 0) break

    rows = rows.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return rows
}

const aggregateData = (data, groupByField, groupByType) => {
  const aggregation = {}

  data.forEach(item => {
    const key = item[groupByField]
    if (!aggregation[key]) {
      let imageField = ''

      switch (groupByType) {
        case 'artist':
          imageField = item['artist_art']
          break
        case 'album':
          imageField = item['album_art']
          break
        case 'track':
          imageField = item['album_art']
          break
        default:
          imageField = ''
      }

      aggregation[key] = {
        title: item[groupByField],
        plays: 0,
        url: item['artist_url'],
        image: imageField,
        genre: item['artist_genres'],
        type: groupByType
      }

      if (groupByType === 'track' || groupByType === 'album') aggregation[key]['artist'] = item['artist_name']
    }

    aggregation[key].plays++
  })

  return Object.values(aggregation).sort((a, b) => b['plays'] - a['plays']).map((item, index) => ({ ...item, rank: index + 1 }))
}

const buildRecents = (data) => {
  return data.map(listen => ({
    title: listen['track_name'],
    artist: listen['artist_name'],
    url: listen['artist_url'],
    timestamp: listen['listened_at'],
    image: listen['album_art'],
    type: 'track'
  })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

const aggregateGenres = (data) => {
  const genreAggregation = {}

  data.forEach(item => {
    const genre = item['genre_name'] || ''
    const genreUrl = item['genre_url'] || ''

    if (!genreAggregation[genre]) {
      genreAggregation[genre] = {
        name: genre,
        url: genreUrl,
        plays: 0,
        type: 'genre'
      }
    }

    genreAggregation[genre]['plays']++
  })

  return Object.values(genreAggregation).sort((a, b) => b['plays'] - a['plays'])
}

export default async function () {
  try {
    const [recentTracks, monthTracks, threeMonthTracks] = await Promise.all([
      fetchDataFromView('recent_tracks'),
      fetchDataFromView('month_tracks'),
      fetchDataFromView('three_month_tracks')
    ])

    return {
      recent: buildRecents(recentTracks),
      week: {
        artists: aggregateData(recentTracks, 'artist_name', 'artist'),
        albums: aggregateData(recentTracks, 'album_name', 'album'),
        tracks: aggregateData(recentTracks, 'track_name', 'track'),
        genres: aggregateGenres(recentTracks),
        totalTracks: recentTracks.length.toLocaleString('en-US')
      },
      month: {
        artists: aggregateData(monthTracks, 'artist_name', 'artist'),
        albums: aggregateData(monthTracks, 'album_name', 'album'),
        tracks: aggregateData(monthTracks, 'track_name', 'track'),
        genres: aggregateGenres(monthTracks),
        totalTracks: monthTracks.length.toLocaleString('en-US')
      },
      threeMonth: {
        artists: aggregateData(threeMonthTracks, 'artist_name', 'artist'),
        albums: aggregateData(threeMonthTracks, 'album_name', 'album'),
        tracks: aggregateData(threeMonthTracks, 'track_name', 'track'),
        genres: aggregateGenres(threeMonthTracks),
        totalTracks: threeMonthTracks.length.toLocaleString('en-US')
      }
    }
  } catch (error) {
    console.error('Error in fetching and processing music data:', error)
    return {}
  }
}