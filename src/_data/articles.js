const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const READWISE_KEY = process.env.API_KEY_READWISE
  const headers = { Authorization: `Token ${READWISE_KEY}` }
  const url = `https://readwise.io/api/v3/list/?category=article`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  }).catch()
  const feed = await res
  const filtered = feed.results.filter((item) => Object.keys(item.tags).includes('shortlist'))
  return filtered.splice(0, 5)
}
