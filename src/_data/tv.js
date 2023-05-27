const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const TV_KEY = process.env.API_KEY_TRAKT
  const url = 'https://api.trakt.tv/users/cdransf/history/shows'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': 2,
        'trakt-api-key': TV_KEY,
      },
    },
  }).catch()
  const shows = await res
  return shows.splice(0, 6)
}
