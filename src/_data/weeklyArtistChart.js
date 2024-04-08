import { readFile } from 'fs/promises'
import { buildChart } from './helpers/music.js'
import { DateTime } from 'luxon'

export default async function () {
  const currentDate = DateTime.now()
  const artists = JSON.parse(await readFile('./src/_data/json/artists-map.json', 'utf8'));
  const albums = JSON.parse(await readFile('./src/_data/json/albums-map.json', 'utf8'));
  const chartData = JSON.parse(await readFile('./src/_data/json/weekly-top-artists-chart.json', 'utf8'))
  const artistChart = buildChart(chartData['data'], artists, albums)['artists'].splice(0, 8)
  let content = 'My top artists for the week: '
  artistChart.forEach((artist, index) => {
    content += `${artist['title']} @ ${artist['plays']} play${parseInt(artist['plays']) > 1 ? 's' : ''}`
    if (index !== artistChart.length - 1) content += ', '
  })
  content += ' #Music'

  return [{
      title: content,
      url: `https://coryd.dev/now?ts=${currentDate.toMillis()}#artists`,
      date: DateTime.fromMillis(parseInt(chartData['timestamp'])).toISO(),
      description: `My top artists for the last week ending ${currentDate.minus({ days: 1 }).toLocaleString(DateTime.DATE_FULL)}.<br/><br/>`
    }]
}