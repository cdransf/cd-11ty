import { readFile } from 'fs/promises'
import { buildChart } from './helpers/music.js'

export default async function () {
  const window = JSON.parse(await readFile('./src/_data/json/scrobbles-window.json', 'utf8'));
  const artists = JSON.parse(await readFile('./src/_data/json/artists-map.json', 'utf8'));
  const albums = JSON.parse(await readFile('./src/_data/json/albums-map.json', 'utf8'));
  const nowPlaying = JSON.parse(await readFile('./src/_data/json/now-playing.json', 'utf8'));
  return buildChart(window, artists, albums, nowPlaying)
}
