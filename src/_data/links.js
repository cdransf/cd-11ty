import EleventyFetch from '@11ty/eleventy-fetch'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const getReadableData = (readable) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    readable.once('error', (err) => reject(err))
    readable.on('data', (chunk) => chunks.push(chunk))
    readable.once('end', () => resolve(chunks.join('')))
  })
}

export default async function () {
   const client = new S3Client({
     credentials: {
       accessKeyId: process.env.ACCESS_KEY_B2,
       secretAccessKey: process.env.SECRET_KEY_B2,
     },
     endpoint: {
       url: 'https://s3.us-west-001.backblazeb2.com',
     },
     region: 'us-west-1',
   })
  const BUCKET_B2 = process.env.BUCKET_B2
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
  const maxRequests = process.env.ELEVENTY_PRODUCTION ? 10 : 2
  let nextPageCursor = null;
  let requestCount = 0;
  let cachedLinks;

  if (process.env.ELEVENTY_PRODUCTION) {
    const cachedLinksOutput = await client.send(
        new GetObjectCommand({
          Bucket: BUCKET_B2,
          Key: 'links.json',
       })
    )
    const cachedLinksData = getReadableData(cachedLinksOutput.Body)
    cachedLinks = await cachedLinksData.then((tracks) => JSON.parse(tracks)).catch()
  }

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
    if (!nextPageCursor || requestCount === maxRequests) break;
  }

  if (process.env.ELEVENTY_PRODUCTION) {
    const mergedData = [...new Set([
      ...Object.values(cachedLinks),
      ...formatLinkData(fullData).filter((link) => link.tags.includes('share'))
    ])]

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_B2,
        Key: 'links.json',
        Body: JSON.stringify(mergedData),
      })
     )

    return mergedData
  }

  return formatLinkData(fullData).filter((link) => link.tags.includes('share'))
}
