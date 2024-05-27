import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const aggregateData = (data) => {
  const aggregation = {}
  data.forEach(item => {
    const key = item['artist_name']
    if (!aggregation[key]) {
      aggregation[key] = {
        name: item['artist_name'],
        genre: item['artists']['genre'],
        mbid: item['artists']['mbid'],
        plays: 0
      }
    }
    aggregation[key].plays++
  })
  return Object.values(aggregation).sort((a, b) => b.plays - a.plays).slice(0, 8)
}

const formatData = (data) => {
  let content = 'My top artists for the week: '
  let description = '<p>My top artists for the last week:</p><ul>'
  data.forEach((artist, index) => {
    content += `${artist['name']} @ ${artist['plays']} play${parseInt(artist['plays']) > 1 ? 's' : ''}`
    description+= `<li>${artist['name']} @ ${artist['plays']} • ${artist['genre']}</li>`
    if (index !== data.length - 1) content += ', '
  })
  description += '</ul>'
  return { content, description }
}

export default async function() {
  try {
    const now = DateTime.now();
    const startOfWeek = now.minus({ days: 7 }).startOf('day')
    const endOfWeek = now.endOf('day')
    const startOfWeekSeconds = startOfWeek.toSeconds()
    const endOfWeekSeconds = endOfWeek.toSeconds()
    const weekNumber = now.toFormat('kkkk-WW')
    let { data: recentCharts } = await supabase
      .from('weekly_charts')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (now.weekday !== 1) return recentCharts.map(chart => {
      const formattedData = formatData(JSON.parse(chart['data']))
      return {
        title: formattedData['content'],
        description: formattedData['description'],
        url: `https://coryd.dev/music?ts=${chart['week']}`,
        date: chart['date']
      }
    })

    if (recentCharts.some(chart => chart['week'] === weekNumber)) {
      return recentCharts.map(chart => {
        const formattedData = formatData(JSON.parse(chart['data']))
        return {
          title: formattedData['content'],
          description: formattedData['description'],
          url: `https://coryd.dev/music?ts=${chart['week']}#artists`,
          date: chart['date']
        }
      })
    }

    let { data: listens, error } = await supabase
      .from('listens')
      .select(`
        listened_at,
        track_name,
        artist_name,
        artists(mbid, genre)
        `)
      .gte('listened_at', startOfWeekSeconds)
      .lte('listened_at', endOfWeekSeconds)

    if (error) throw error

    const aggregatedData = aggregateData(listens)
    const artistNames = aggregatedData.map(artist => artist.name)
    let { error: artistsError } = await supabase
      .from('artists')
      .select('name_string, genre, mbid')
      .in('name_string', artistNames)

    if (artistsError) throw artistsError

    const topArtists = aggregatedData.map(artist => {
      return {
        name: artist.name,
        genre: artist?.genre || '',
        plays: artist.plays,
        mbid: artist?.mbid || ''
      }
    })

    const { error: insertError } = await supabase
      .from('weekly_charts')
      .insert([{ week: weekNumber, date: now.toISODate(), data: JSON.stringify(topArtists) }])
    if (insertError) throw insertError
    const formattedData = formatData(topArtists)
    const recentChartData = recentCharts.map(chart => {
      const formattedData = formatData(JSON.parse(chart['data']))
      return {
        title: formattedData['content'],
        description: formattedData['description'],
        url: `https://coryd.dev/music?ts=${chart['week']}#artists`,
        date: chart['date']
      }
    })
    return [
      {
        title: formattedData['content'],
        description: formattedData['description'],
        url: `https://coryd.dev/music?ts=${weekNumber}#artists`,
        date: now.toISODate()
      },
      ...recentChartData
    ]
  } catch (error) {
    console.error('Error:', error.message)
  }
}