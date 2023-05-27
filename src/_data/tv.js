const { extract } = require('@extractus/feed-extractor')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const TV_KEY = process.env.API_KEY_TRAKT
  const url = `https://trakt.tv/users/cdransf/history.atom?slurm=${TV_KEY}`
  // noinspection JSCheckFunctionSignatures
  const asset = new AssetCache('tv_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await extract(url, {
    getExtraEntryFields: (feedEntry) => {
      const image = feedEntry['media:thumbnail']['@_url']
      return {
        image,
      }
    },
  }).catch((error) => {
    console.log(error.message)
  })
  const data = res.entries.splice(0, 6)
  await asset.save(data, 'json')
  return data
}
