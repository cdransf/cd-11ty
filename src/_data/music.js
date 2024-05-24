import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { sanitizeMediaString, parseCountryField } from './utilities/index.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchDataForPeriod = async (startPeriod, fields, table) => {
  const PAGE_SIZE = 1000
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
      console.error(error)
      break
    }

    rows = rows.concat(data)

    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return rows
}

const fetchAllTimeData = async (fields, table) => {
  const PAGE_SIZE = 1000
  let rows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .order('listened_at', { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

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
      if (groupByType === 'track') {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item['albums']['mbid'],
          url: `https://coryd.dev/music/artists/${sanitizeMediaString(item['artist_name'])}-${sanitizeMediaString(parseCountryField(item['artists']['country']))}`,
          image: item['albums']?.['image'] || '',
          timestamp: item['listened_at'],
          type: groupByType,
          genre: item['artists']?.['genre'] || ''
        }
      } else {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item[groupByType]?.['mbid'] || '',
          url: `https://coryd.dev/music/artists/${sanitizeMediaString(item['artist_name'])}-${sanitizeMediaString(parseCountryField(item['artists']['country']))}`,
          image: item[groupByType]?.image || '',
          type: groupByType,
          genre: item['artists']?.['genre'] || ''
        }
      }
      if (
        groupByType === 'track' ||
        groupByType === 'albums'
      ) aggregation[key]['artist'] = item['artist_name']
    }
    aggregation[key].plays++
  })

  const aggregatedData = Object.values(aggregation).sort((a, b) => b.plays - a.plays)

  aggregatedData.forEach((item, index) => {
    item.rank = index + 1
  })

  return aggregatedData.filter(item => item.plays > 0)
}

const aggregateGenres = (data) => {
  const genreAggregation = {}
  data.forEach(item => {
    const genre = item.artists.genre
    if (!genreAggregation[genre]) {
      genreAggregation[genre] = { genre, plays: 0 }
    }
    genreAggregation[genre].plays++
  })
  return Object.values(genreAggregation).sort((a, b) => b.plays - a.plays)
}

export default async function() {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'), // last week
    month: DateTime.now().minus({ days: 30 }).startOf('day'), // last 30 days
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day'), // last three months
  }

  const results = {}
  const selectFields = `
    track_name,
    artist_name,
    album_name,
    album_key,
    listened_at,
    artists (mbid, image, genre, country),
    albums (mbid, image)
  `

  for (const [period, startPeriod] of Object.entries(periods)) {
    const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'listens')
    results[period] = {
      artists: aggregateData(periodData, 'artist_name', 'artists'),
      albums: aggregateData(periodData, 'album_name', 'albums'),
      tracks: aggregateData(periodData, 'track_name', 'track'),
      genres: aggregateGenres(periodData),
      totalTracks: periodData?.length?.toLocaleString('en-US')
    }
  }

  // Fetch and aggregate all-time data
  const allTimeData = await fetchAllTimeData(selectFields, 'listens')
  results['allTime'] = {
    artists: aggregateData(allTimeData, 'artist_name', 'artists'),
    albums: aggregateData(allTimeData, 'album_name', 'albums'),
    tracks: aggregateData(allTimeData, 'track_name', 'track'),
    genres: aggregateGenres(allTimeData),
    totalTracks: allTimeData?.length?.toLocaleString('en-US')
  }

  const recentData = await fetchDataForPeriod(DateTime.now().minus({ days: 7 }), selectFields, 'listens')

  results['recent'] = {
    artists: aggregateData(recentData, 'artist_name', 'artists'),
    albums: aggregateData(recentData, 'album_name', 'albums'),
    tracks: aggregateData(recentData, 'track_name', 'track'),
    tracksChronological: aggregateData(recentData, 'track_name', 'track').sort((a, b) => b.timestamp - a.timestamp),
    genres: aggregateGenres(recentData),
    totalTracks: recentData?.length?.toLocaleString('en-US')
  }
  results['nowPlaying'] = results['recent']['tracksChronological'][0]

  return results
}