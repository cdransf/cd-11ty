const Parser = require('rss-parser')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const parser = new Parser()
  const url = 'https://letterboxd.com/cdme/rss'
  const asset = new AssetCache('movies_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await parser.parseURL(url).catch((error) => {
    console.log(error.message)
  })
  const data = res.items
    .map((item) => {
      const images = item['content']?.match(/<img [^>]*src="[^"]*"[^>]*>/gm) || []
      item.image = images.length
        ? images.map((image) => image.replace(/.*src="([^"]*)".*/, '$1'))[0]
        : 'https://cdn.coryd.dev/movies/missing-movie.jpg'
      return item
    })
    .splice(0, 6)
  await asset.save(data, 'json')
  return data
}
