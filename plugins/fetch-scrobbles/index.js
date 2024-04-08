import { getStore, setEnvironmentContext } from '@netlify/blobs'
import { DateTime } from 'luxon'
import fs from 'fs'

const getKeys = (months = 1) => {
  const currentDate = DateTime.now()
  const weeks = Math.floor((currentDate.daysInMonth * months) / 7)
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

const filterOldScrobbles = (scrobbles, months = 1) => {
  const currentDate = DateTime.now()
  const weeks = Math.floor((currentDate.daysInMonth * months) / 7)
  const windowEnd = DateTime.now().minus({ weeks });
  return scrobbles.filter(scrobble => {
    const timestamp = DateTime.fromISO(scrobble.timestamp);
    return timestamp >= windowEnd;
  });
}

export const onPreBuild = async ({ constants }) => {
  setEnvironmentContext({
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  })

  const monthKeys = getKeys()
  const monthChartData = { data: [] }
  const threeMonthKeys = getKeys(3)
  const threeMonthChartData = { data: [] }
  const scrobbles = getStore('scrobbles')
  const artists = getStore('artists')
  const albums = getStore('albums')
  const windowData = await scrobbles.get('window', { type: 'json'})
  const artistsMap = await artists.get('artists-map', { type: 'json' })
  const albumsMap = await albums.get('albums-map', { type: 'json' })
  const nowPlaying = await scrobbles.get('now-playing', { type: 'json'})

  for (const key of monthKeys) {
    const scrobbleData = await scrobbles.get(key, { type: 'json'})
    monthChartData['data'].push(...scrobbleData['data'])
  }

  for (const key of threeMonthKeys) {
    const scrobbleData = await scrobbles.get(key, { type: 'json'})
    threeMonthChartData['data'].push(...scrobbleData['data'])
  }

  fs.writeFileSync('./src/_data/json/scrobbles-window.json', JSON.stringify(windowData))
  fs.writeFileSync('./src/_data/json/artists-map.json', JSON.stringify(artistsMap))
  fs.writeFileSync('./src/_data/json/albums-map.json', JSON.stringify(albumsMap))
  fs.writeFileSync('./src/_data/json/now-playing.json', JSON.stringify(nowPlaying))
  fs.writeFileSync('./src/_data/json/scrobbles-month-chart.json', JSON.stringify({ data: filterOldScrobbles(monthChartData.data) }))
  fs.writeFileSync('./src/_data/json/scrobbles-three-month-chart.json', JSON.stringify({ data: filterOldScrobbles(threeMonthChartData.data, 3) }))
}