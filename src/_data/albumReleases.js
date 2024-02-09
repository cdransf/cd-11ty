import { AssetCache } from '@11ty/eleventy-fetch'
import ics from 'ics-to-json-extended'
import { DateTime } from 'luxon'

export default async function () {
  const URL = process.env.SECRET_FEED_ALBUM_RELEASES
  const icsToJson = ics.default
  if (process.env.ELEVENTY_PRODUCTION) {
    const asset = new AssetCache('album_release_data')
    if (asset.isCacheValid('1h')) return await asset.getCachedValue()
    const icsRes = await fetch(URL)
    const icsData = await icsRes.text()
    const data = icsToJson(icsData)
    const albumReleases = data
      .filter((d) => DateTime.fromISO(d.startDate) > DateTime.now())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map((release) => {
        return {
          date: release.startDate,
          url: release.location,
          title: release.summary.replace(/\\/g, ''),
        }
      })
    await asset.save(albumReleases, 'json')
    return albumReleases
  } else {
    return {}
  }
}
