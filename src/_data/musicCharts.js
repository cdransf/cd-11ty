import { readFile } from 'fs/promises'
import { buildChart } from './helpers/music.js'

export default async function () {
  const monthChart = JSON.parse(await readFile('./src/_data/json/scrobbles-month-chart.json', 'utf8'));
  console.log(buildChart(monthChart['data'], artists, albums, nowPlaying))
  return {
    month: buildChart(monthChart['data'], artists, albums, nowPlaying)
  }
}