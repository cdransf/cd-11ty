import { getStore, setEnvironmentContext } from '@netlify/blobs'
import { DateTime } from 'luxon'
import fs from 'fs'

const getKeys = () => {
  const currentDate = DateTime.now()
  return [
    `${currentDate.year}-${currentDate.weekNumber}`
    `${currentDate.minus({ weeks: 1 }).year}-${currentDate.minus({ weeks: 1 }).weekNumber}`,
    `${currentDate.minus({ weeks: 2 }).year}-${currentDate.minus({ weeks: 2 }).weekNumber}`,
    `${currentDate.minus({ weeks: 3 }).year}-${currentDate.minus({ weeks: 3 }).weekNumber}`,
    `${currentDate.minus({ weeks: 4 }).year}-${currentDate.minus({ weeks: 4 }).weekNumber}`,
  ]
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
  keys.forEach(async key => {
    const scrobbleData = await scrobbles.get(key, { type: 'json'})
    data.push(scrobbleData['data'])
  })
  console.log(chartData)
  fs.writeFileSync('./src/_data/json/scrobbles-window.json', JSON.stringify(windowData))
  fs.writeFileSync('./src/_data/json/artists-map.json', JSON.stringify(artistsMap))
  fs.writeFileSync('./src/_data/json/albums-map.json', JSON.stringify(albumsMap))
  fs.writeFileSync('./src/_data/json/now-playing.json', JSON.stringify(nowPlaying))
  fs.writeFileSync('./src/_data/json/scrobbles-month-chart.json', JSON.stringify(chartData))
}