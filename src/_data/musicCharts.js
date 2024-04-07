import { readFile } from 'fs/promises'
import { buildChart, buildTracksWithArt } from './helpers/music.js'

export default async function () {
  const monthChart = JSON.parse(await readFile('./src/_data/json/scrobbles-month-chart.json', 'utf8'));
  const threeMonthChart = JSON.parse(await readFile('./src/_data/json/scrobbles-three-month-chart.json', 'utf8'));
  const artists = JSON.parse(await readFile('./src/_data/json/artists-map.json', 'utf8'));
  const albums = JSON.parse(await readFile('./src/_data/json/albums-map.json', 'utf8'));
  const recent = JSON.parse(await readFile('./src/_data/json/scrobbles-window.json', 'utf8'))['data'].reverse().splice(0,10)
  return {
    recent: buildTracksWithArt(recent, artists, albums),
    month: buildChart(monthChart['data'], artists, albums),
    threeMonthChart: buildChart(threeMonthChart['data'], artists, albums),
  }
}