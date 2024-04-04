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
  const keys = getKeys()
  const data = []
  setEnvironmentContext({
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  })
  const scrobbles = getStore('scrobbles')
  keys.forEach(async key => {
    const scrobbleData = await scrobbles.get(key, { type: 'json'})
    data.push(scrobbleData['data'])
  })
  console.log(data)
  fs.writeFileSync('./src/_data/json/scrobbles-month-chart.json', JSON.stringify(data))
}