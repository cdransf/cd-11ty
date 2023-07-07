const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const KEY = process.env.CONSUMER_KEY_POCKET
  const TOKEN = process.env.ACCESS_TOKEN_POCKET
  const url = 'https://getpocket.com/v3/get'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      method: 'POST',
      body: JSON.stringify({
          'consumer_key': KEY,
        'access_token': TOKEN,
        'favorite': 1,
        }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }).catch()
  const data = await res
  const articles = Object.values(data.list).map(article => {
    return {
      title: article['resolved_title'],
      url: article['resolved_url'],
      time: article['time_added']
    }
  })
  return articles.sort((a, b) => b.time - a.time).splice(0, 5)
}
