const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const APPLE_BEARER = process.env.API_BEARER_APPLE_MUSIC
  const APPLE_TOKEN = process.env.API_TOKEN_APPLE_MUSIC
  const url = `https://api.music.apple.com/v1/me/history/heavy-rotation`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APPLE_BEARER}`,
        'music-user-token': `${APPLE_TOKEN}`,
      },
    },
  }).catch()
  const rotation = await res
  return rotation.data
}
