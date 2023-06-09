const { AssetCache } = require('@11ty/eleventy-fetch')
const ics = require('ics-to-json-extended')
const { DateTime } = require('luxon')

module.exports = async function () {
  const URL = process.env.SECRET_FEED_ALBUM_RELEASES
  const icsToJson = ics.default
  const asset = new AssetCache('album_release_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const icsRes = await fetch(URL)
  const icsData = await icsRes.text()
  const data = icsToJson(icsData)
  const albumReleases = data.filter((d) => DateTime.fromISO(d.startDate) > DateTime.now())
  return albumReleases.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
}
