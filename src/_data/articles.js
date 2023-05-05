const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MATTER_TOKEN = process.env.ACCESS_TOKEN_MATTER
  const headers = { Authorization: `Bearer ${MATTER_TOKEN}` }
  const url = `https://web.getmatter.com/api/library_items/favorites_feed`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  })
  const feed = await res
  const articles = feed.feed.splice(0, 5)
  return articles
}
