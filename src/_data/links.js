const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const API_TOKEN_READWISE = process.env.API_TOKEN_READWISE
  const url = 'https://readwise.io/api/v3/list?location=archive'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        Authorization: `Token ${API_TOKEN_READWISE}`,
      },
    },
  }).catch()
  const data = await res
  const links = data['results'].map((link) => {
    return {
      title: link['title'],
      url: link['source_url'],
      tags: [...new Set(Object.keys(link['tags']))],
      date: link['created_at'],
      description: `${link['summary']}<br/><br/>`,
    }
  })
  return links.filter((link) => link.tags.includes('share'))
}
