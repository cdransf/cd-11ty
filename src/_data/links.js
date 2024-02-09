import EleventyFetch from '@11ty/eleventy-fetch'
import LinksMock from './json/mocks/links.js'

export default async function () {
  const API_TOKEN_READWISE = process.env.API_TOKEN_READWISE
  const url = 'https://readwise.io/api/v3/list?location=archive'
  const formatLinkData = (links) => links.map((link) => {
    return {
      title: link['title'],
      url: link['source_url'],
      tags: [...new Set(Object.keys(link['tags']))],
      date: `${link['updated_at'] || link['created_at']}`,
      author: link['author'],
      summary: link['summary'],
      note: link['notes'],
      description: `${link['summary']}<br/><br/>`,
    }
  })

  if (process.env.ELEVENTY_PRODUCTION) {
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
    return formatLinkData(data['results']).filter((link) => link.tags.includes('share'))
  } else {
    return formatLinkData(LinksMock)
  }

}
