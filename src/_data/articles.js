const Parser = require('rss-parser')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const parser = new Parser()
  const url = process.env.SECRET_FEED_INSTAPAPER_LIKES
  const asset = new AssetCache('articles_data')
  if (asset.isCacheValid('1h')) return await asset.getCachedValue()
  const res = await parser.parseURL(url).catch((error) => {
    console.log(error.message)
  })
  const articles = res.items.map((item) => {
    return {
      title: item['title'],
      date: item['pubDate'],
      summary: item['description'],
      url: item['link'],
      id: item['guid'],
      type: 'article',
    }
  })
  await asset.save(articles, 'json')
  return articles
}
