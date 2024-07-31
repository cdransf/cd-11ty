import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from '../../config/utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 1000

const fetchDataForPeriod = async (startPeriod, fields, table) => {
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .order('listened_at', { ascending: false })
      .gte('listened_at', startPeriod.toSeconds())
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(`Error fetching data from ${table}:`, error)
      break
    }

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
        mbid: item[groupByType]?.['mbid'] || '',
        url: `/music/artists/${sanitizeMediaString(item['artist_name'])}-${sanitizeMediaString(parseCountryField(item['artist_country']))}`,
        image: `/${item[groupByType]}`,
        type: groupByType === 'artist_art' ? 'artist' : groupByType === 'album_art' ? 'album' : groupByType,
        genre: genreMapping[item['artist_genres']] || ''
      }
      if (groupByType === 'track' || groupByType === 'album_art') aggregation[key]['artist'] = item['artist_name']
    }
    aggregation[key].plays++
  })

  return Object.values(aggregation).sort((a, b) => b.plays - a.plays).map((item, index) => ({ ...item, rank: index + 1 }))
}

const buildRecents = (data) => {
  return data.map(listen => ({
    title: listen['track_name'],
    artist: listen['artist_name'],
    url: `/music/artists/${sanitizeMediaString(listen['artist_name'])}-${sanitizeMediaString(parseCountryField(listen['artist_country']))}`,
    timestamp: listen['listened_at'],
    image: `/${listen['album_art']}`
  })).sort((a, b) => b.timestamp - a.timestamp)
}

const aggregateGenres = (data, genreMapping) => {
  const genreAggregation = {}

  data.forEach(item => {
    const genre = genreMapping[item['artist_genres']] || ''

    if (!genreAggregation[genre]) genreAggregation[genre] = { genre, plays: 0 }
    genreAggregation[genre]['plays']++
  })
  return Object.values(genreAggregation).sort((a, b) => b['plays'] - a['plays'])
}

export default async function () {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'),
    month: DateTime.now().minus({ days: 30 }).startOf('day'),
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day')
  }

  const selectFields = `
    id,
    listened_at,
    track_name,
    artist_name,
    album_name,
    album_key,
    artist_mbid,
    artist_art,
    artist_genres,
    artist_country,
    album_mbid,
    album_art
  `

  try {
    const genreMapping = await fetchGenreMapping()

    const results = await Promise.all(Object.entries(periods).map(async ([period, startPeriod]) => {
      const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'optimized_listens')
      return {
        [period]: {
          artists: aggregateData(periodData, 'artist_name', 'artist_art', genreMapping),
          albums: aggregateData(periodData, 'album_name', 'album_art', genreMapping),
          tracks: aggregateData(periodData, 'track_name', 'track', genreMapping),
          genres: aggregateGenres(periodData, genreMapping),
          totalTracks: periodData.length.toLocaleString('en-US')
        }
      }
    }))

    const recentData = await fetchDataForPeriod(DateTime.now().minus({ days: 7 }), selectFields, 'optimized_listens')

    results.push({ recent: buildRecents(recentData) })

    return Object.assign({}, ...results)
  } catch (error) {
    console.error('Error in fetching and processing music data:', error)
    return {}
  }
}