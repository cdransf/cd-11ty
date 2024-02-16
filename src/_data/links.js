import EleventyFetch from '@11ty/eleventy-fetch'

export default async function () {
  const API_TOKEN_READWISE = process.env.API_TOKEN_READWISE
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
  const fullData = [];
  let nextPageCursor = null;
  let requestCount = 0;

  while (true) {
    const queryParams = new URLSearchParams()
    if (nextPageCursor) queryParams.append('pageCursor', nextPageCursor)
    const res = EleventyFetch(`https://readwise.io/api/v3/list?location=archive&${queryParams.toString()}`, {
      duration: '1h',
      type: 'json',
      fetchOptions: {
        headers: {
          Authorization: `Token ${API_TOKEN_READWISE}`,
        },
      },
    }).catch()
    const data = await res
    fullData.push(...data['results']);
    nextPageCursor = data['nextPageCursor']
    requestCount++;
    if (!nextPageCursor || requestCount === 20) break;
  }

  return formatLinkData(fullData).filter((link) => link.tags.includes('share'))
}
