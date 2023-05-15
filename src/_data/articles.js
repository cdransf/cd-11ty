const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const PINBOARD_KEY = process.env.API_KEY_PINBOARD
  const url = `https://api.pinboard.in/v1/posts/recent?auth_token=${PINBOARD_KEY}&count=100&format=json`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const feed = await res
  const filtered = feed.posts.filter((item) => {
    return item.shared === 'yes' && item.tags.includes('share')
  })
  return filtered.splice(0, 5)
}
