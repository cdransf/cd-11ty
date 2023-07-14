const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const READWISE_TOKEN = process.env.API_TOKEN_READWISE
  const headers = { Authorization: `Token ${READWISE_TOKEN}` }
  const url = 'https://readwise.io/api/v3/list?category=article'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  })
  const data = await res
  const links = data.results.filter((result) => Object.keys(result.tags).includes('share'))
  return links.splice(0, 5).map((link) => {
    return {
      title: link['title'],
      url: link['source_url'],
      time: link['published_date'],
      summary: link['summary'],
      id: link['id'],
    }
  })
}
