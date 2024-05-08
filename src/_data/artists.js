import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchDataForPeriod = async (startPeriod, fields, table, allTime = false) => {
  let query = supabase.from(table).select(fields).order('listened_at', { ascending: false })

  if (!allTime) query = query.gte('listened_at', startPeriod.toUTC().toSeconds())

  const { data, error } = await query
  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  return data
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
          mbid: item['albums']?.mbid || '',
          url: item['albums']?.mbid ? `https://musicbrainz.org/release/${item['albums'].mbid}` : `https://musicbrainz.org/search?query=${encodeURIComponent(item['album_name'])}&type=release`,
          image: item['albums']?.image || '',
          type: groupByType
        }
      } else {
        aggregation[key] = {
          title: item[groupByField],
          plays: 0,
          mbid: item[groupByType]?.mbid || '',
          url: item[groupByType]?.mbid ? `https://musicbrainz.org/${groupByType === 'albums' ? 'release' : 'artist'}/${item[groupByType].mbid}` : `https://musicbrainz.org/search?query=${encodeURIComponent(item[groupByField])}&type=${groupByType === 'albums' ? 'release' : 'artist'}`,
          image: item[groupByType]?.image || '',
          type: groupByType
        }
      }
    }
    aggregation[key].plays++
  })
  return Object.values(aggregation).sort((a, b) => b.plays - a.plays)
}


export default async function() {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'), // Last week
    month: DateTime.now().minus({ days: 30 }).startOf('day'), // Last 30 days
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day'), // Last three months
    year: DateTime.now().minus({ years: 1 }).startOf('day'), // Last 365 days
    allTime: null  // Null indicates no start period constraint
  }

  const results = {}
  const selectFields = `
    track_name,
    artist_name,
    album_name,
    album_key,
    artists (mbid, image),
    albums (mbid, image)
  `

  for (const [period, startPeriod] of Object.entries(periods)) {
    const isAllTime = period === 'allTime'
    const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'listens', isAllTime)
    results[period] = {
      artists: aggregateData(periodData, 'artist_name', 'artists'),
      albums: aggregateData(periodData, 'album_name', 'albums'),
      tracks: aggregateData(periodData, 'track_name', 'track')
    }
  }

  const recentData = await fetchDataForPeriod(DateTime.now().minus({ days: 7 }), selectFields, 'listens')

  results.recent = {
    artists: aggregateData(recentData, 'artist_name', 'artists'),
    albums: aggregateData(recentData, 'album_name', 'albums'),
    tracks: aggregateData(recentData, 'track_name', 'track')
  }

  return results
}
