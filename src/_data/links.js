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
    const tags = article['content']['tags'].map((tag) => tag['name'])
    const shareTags = tags
      .map((tag) => `#${tag}`)
      .join(' ')
      .trim()
    return {
      url: article['content']['url'],
      title: article['content']['title'],
      date: article['content']['library']['modified_date']
        ? new Date(article['content']['library']['modified_date'])
        : new Date(article['content']['publication_date']),
      description: article['content']['excerpt'],
      notes: article['content']['my_notes'],
      tags,
      shareTags,
      id: btoa(article['id']),
    }
  })
}
