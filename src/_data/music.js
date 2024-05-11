import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

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

const aggregateData = (data, groupByField, groupByType, sort = true) => {
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
          timestamp: item['listened_at'],
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
      if (
        groupByType === 'track' ||
        groupByType === 'albums'
      ) aggregation[key]['artist'] = item['artist_name']
    }
    aggregation[key].plays++
  })
  const aggregatedData = sort ? Object.values(aggregation).sort((a, b) => b.plays - a.plays) : Object.values(aggregation)
  return aggregatedData
}


export default async function() {
  const periods = {
    week: DateTime.now().minus({ days: 7 }).startOf('day'), // Last week
    month: DateTime.now().minus({ days: 30 }).startOf('day'), // Last 30 days
    threeMonth: DateTime.now().minus({ months: 3 }).startOf('day'), // Last three months
    year: DateTime.now().minus({ years: 1 }).startOf('day'), // Last 365 days
  }

  const results = {}
  const selectFields = `
    track_name,
    artist_name,
    album_name,
    album_key,
    listened_at,
    artists (mbid, image),
    albums (mbid, image)
  `

  for (const [period, startPeriod] of Object.entries(periods)) {
    const periodData = await fetchDataForPeriod(startPeriod, selectFields, 'listens')
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
    tracks: aggregateData(recentData, 'track_name', 'track'),
    trackChart: aggregateData(recentData, 'track_name', 'track', false),
  }
  results.nowPlaying = results.recent.trackChart[0]

  return results
}