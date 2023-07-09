const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MATTER_TOKEN = process.env.API_TOKEN_MATTER
  const headers = { Authorization: `Bearer ${MATTER_TOKEN}` }
  const url = `https://web.getmatter.com/api/library_items/favorites_feed`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  })
  const feed = await res
  const links = feed.feed.splice(0, 5).map(link => {
    return {
      title: link.content.title,
      url: link.content.url
    }
  })
  return links
}
