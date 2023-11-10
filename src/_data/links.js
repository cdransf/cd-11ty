const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const API_TOKEN_PINBOARD = process.env.API_TOKEN_PINBOARD
  const url = `https://api.pinboard.in/v1/posts/recent?auth_token=${API_TOKEN_PINBOARD}&format=json&tag=share`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const links = await res
  return links['posts'].map((link) => {
    return {
      title: link['description'],
      url: link['href'],
      tags: [...new Set(link['tags'].split(' '))],
      date: link['time'],
      description: link['extended'],
    }
  })
}
