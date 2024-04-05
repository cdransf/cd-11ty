import { getStore, setEnvironmentContext } from '@netlify/blobs'
import { DateTime } from 'luxon'
import fs from 'fs'

const getKeys = () => {
  const currentDate = DateTime.now()
  const weeks = Math.floor(currentDate.daysInMonth / 7)
  let count = 0
  const keys = []

  while (count < weeks) {
    const weeks = 1 * (count + 1)
    const date = DateTime.now().minus({ weeks })
    keys.push(`${date.year}-${date.weekNumber}`)
    count++;
  }

  return keys
}

export const onPreBuild = async ({ constants }) => {
  setEnvironmentContext({
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  })
  const keys = getKeys()
  const chartData = []
  const scrobbles = getStore('scrobbles')
  const artists = getStore('artists')
  const albums = getStore('albums')
  const windowData = await scrobbles.get('window', { type: 'json'})
  const artistsMap = await artists.get('artists-map', { type: 'json' })
  const albumsMap = await albums.get('albums-map', { type: 'json' })
  const nowPlaying = await scrobbles.get('now-playing', { type: 'json'})
  for (const key of keys) {
    const scrobbleData = await scrobbles.get(key, { type: 'json'})
    data.push(scrobbleData['data'])
  }
  console.log(chartData)
  fs.writeFileSync('./src/_data/json/scrobbles-window.json', JSON.stringify(windowData))
  fs.writeFileSync('./src/_data/json/artists-map.json', JSON.stringify(artistsMap))
  fs.writeFileSync('./src/_data/json/albums-map.json', JSON.stringify(albumsMap))
  fs.writeFileSync('./src/_data/json/now-playing.json', JSON.stringify(nowPlaying))
  fs.writeFileSync('./src/_data/json/scrobbles-month-chart.json', JSON.stringify(chartData))
}