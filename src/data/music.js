import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchDataFromView = async (viewName, fields) => {
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(viewName)
      .select(fields)
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

const fetchGenreMapping = async () => {
  const { data, error } = await supabase
    .from('genres')
    .select('id, name')

  if (error) {
    console.error('Error fetching genres:', error)
    return {}
  }
  return data.reduce((acc, genre) => {
    acc[genre['id']] = genre['name']
    return acc
  }, {})
}

const aggregateData = (data, groupByField, groupByType, genreMapping) => {
  const aggregation = {}
  data.forEach(item => {
    const key = item[groupByField]
    if (!aggregation[key]) {
      aggregation[key] = {
        title: item[groupByField],
        plays: 0,
        url: item['artist_url'],
        image: `/${item[groupByType]}`,
        type: groupByType === 'artist_art' ? 'artist' : groupByType === 'album_art' ? 'album' : groupByType,
        genre: genreMapping[item['artist_genres']] || ''
      }
      if (groupByType === 'track' || groupByType === 'album_art') aggregation[key]['artist'] = item['artist_name']
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
    image: `/${listen['album_art']}`
  })).sort((a, b) => b.timestamp - a.timestamp)
}

const aggregateGenres = (data, genreMapping) => {
  const genreAggregation = {}

  data.forEach(item => {
    const genre = genreMapping[item['artist_genres']] || ''
    if (!genreAggregation[genre]) genreAggregation[genre] = { name: genre, url: item['genre_url'], plays: 0 }
    genreAggregation[genre]['plays']++
  })
  return Object.values(genreAggregation).sort((a, b) => b['plays'] - a['plays'])
}

export default async function () {
  const selectFields = `
    listened_at,
    track_name,
    artist_name,
    album_name,
    album_key,
    artist_art,
    artist_genres,
    artist_country,
    album_art,
    artist_url,
    genre_url
  `

  try {
    const genreMapping = await fetchGenreMapping()

    const [recentTracks, monthTracks, threeMonthTracks] = await Promise.all([
      fetchDataFromView('recent_tracks', selectFields),
      fetchDataFromView('month_tracks', selectFields),
      fetchDataFromView('three_month_tracks', selectFields)
    ])

    return {
      recent: buildRecents(recentTracks),
      week: {
        artists: aggregateData(recentTracks, 'artist_name', 'artist_art', genreMapping),
        albums: aggregateData(recentTracks, 'album_name', 'album_art', genreMapping),
        tracks: aggregateData(recentTracks, 'track_name', 'track', genreMapping),
        genres: aggregateGenres(recentTracks, genreMapping),
        totalTracks: recentTracks.length.toLocaleString('en-US')
      },
      month: {
        artists: aggregateData(monthTracks, 'artist_name', 'artist_art', genreMapping),
        albums: aggregateData(monthTracks, 'album_name', 'album_art', genreMapping),
        tracks: aggregateData(monthTracks, 'track_name', 'track', genreMapping),
        genres: aggregateGenres(monthTracks, genreMapping),
        totalTracks: monthTracks.length.toLocaleString('en-US')
      },
      threeMonth: {
        artists: aggregateData(threeMonthTracks, 'artist_name', 'artist_art', genreMapping),
        albums: aggregateData(threeMonthTracks, 'album_name', 'album_art', genreMapping),
        tracks: aggregateData(threeMonthTracks, 'track_name', 'track', genreMapping),
        genres: aggregateGenres(threeMonthTracks, genreMapping),
        totalTracks: threeMonthTracks.length.toLocaleString('en-US')
      }
    }
  } catch (error) {
    console.error('Error in fetching and processing music data:', error)
    return {}
  }
}