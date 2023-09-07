const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const MATTER_TOKEN = process.env.ACCESS_TOKEN_MATTER
  const headers = { Cookie: MATTER_TOKEN }
  const url = `https://web.getmatter.com/api/library_items/favorites_feed`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: { headers },
  })
  const feed = await res
  const articles = feed.feed
  return articles.reverse().map((article) => {
    return {
      url: article['content']['url'],
      title: article['content']['title'],
      date: article['content']['publication_date']
        ? new Date(article['content']['publication_date'])
        : new Date(article['content']['feed_date']),
      summary: article['content']['excerpt'],
      notes: article['content']['my_notes'],
      id: btoa(article['id']),
    }
  })
}
