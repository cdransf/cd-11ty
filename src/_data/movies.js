const { extract } = require('@extractus/feed-extractor')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const url = 'https://letterboxd.com/cdme/rss'
  // noinspection JSCheckFunctionSignatures
  const asset = new AssetCache('movies_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await extract(url, {
    getExtraEntryFields: (feedEntry) => {
      const images = feedEntry['description']?.match(/<img [^>]*src="[^"]*"[^>]*>/gm) || []
      return {
        image: images.length
          ? images.map((image) => image.replace(/.*src="([^"]*)".*/, '$1'))[0]
          : '',
      }
    },
  }).catch((error) => {
    console.log(error.message)
  })
  const data = res.entries.splice(0, 6)
  await asset.save(data, 'json')
  return data
}
