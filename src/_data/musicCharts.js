import { readFile } from 'fs/promises'
import { buildChart } from './helpers/music.js'

export default async function () {
  const monthChart = JSON.parse(await readFile('./src/_data/json/scrobbles-month-chart.json', 'utf8'));
  const artists = JSON.parse(await readFile('./src/_data/json/artists-map.json', 'utf8'));
  const albums = JSON.parse(await readFile('./src/_data/json/albums-map.json', 'utf8'));
  console.log(buildChart(monthChart['data'], artists, albums))
  return {
    month: buildChart(monthChart['data'], artists, albums)
  }
}