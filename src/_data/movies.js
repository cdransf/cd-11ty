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
  const movies = res.items
    .map((item) => {
      const images = item['content']?.match(/<img [^>]*src="[^"]*"[^>]*>/gm) || []
      return {
        name: item['title'],
        date: item['pubDate'],
        summary: item['contentSnippet'],
        image: images.length
          ? images
              .map((image) => image.replace(/.*src="([^"]*)".*/, '$1'))[0]
              .replace('https://a.ltrbxd.com', 'https://movies.coryd.dev')
          : 'https://cdn.coryd.dev/movies/missing-movie.jpg',
        url: item['link'],
        id: item['guid'],
      }
    })
    .filter((movie) => !movie.url.includes('/list/'))
  await asset.save(movies, 'json')
  return movies
}
