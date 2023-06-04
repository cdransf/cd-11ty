const { extract } = require('@extractus/feed-extractor')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const URL = process.env.SECRET_FEED_INSTAPAPER_LIKES
  // noinspection JSCheckFunctionSignatures
  const asset = new AssetCache('links_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await extract(URL, {
    getExtraEntryFields: (feedEntry) => {
      return {
        time: feedEntry['pubDate'] || '',
      }
    },
  })
    .catch((error) => {
      console.log(error.message)
    })
    .catch()
  const data = res.entries
  const links = data.splice(0, 5)
  await asset.save(links, 'json')
  return links
}
