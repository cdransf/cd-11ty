---
date: '2024-02-19'
title: 'Using B2 as a JSON data store'
description: "My links page is powered by the Readwise Reader API but because there are, quite reasonably, rate limits in place, I've gone ahead and reduced the page count I fetch on each build and cached older link data from past builds in a B2 bucket."
tags: ['Eleventy', 'development', 'javascript']
---
My links page is powered by the [Readwise Reader](https://readwise.io/reader_api) API but because there are, quite reasonably, rate limits in place, I've gone ahead and reduced the page count I fetch on each build and cached older link data from past builds in a B2 bucket.<!-- excerpt -->

To do this, I've modified `_data/links.js` to leverage the `@aws-sdk/client-s3` package and created a new B2 bucket specifically for my site.

First, I import the required packages from the new `AWS` dependency (which can be used as Backblaze offers an S3 compatible API):

```javascipt
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
```

I added a method to get readable data from the bucket:

```javascript
const getReadableData = (readable) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    readable.once('error', (err) => reject(err))
    readable.on('data', (chunk) => chunks.push(chunk))
    readable.once('end', () => resolve(chunks.join('')))
  })
}
```

Initialize a new S3 client:

```javascript
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
```

Fetch my cached link data from the bucket:

```javascript
const BUCKET_B2 = process.env.BUCKET_B2
...
const cachedLinksOutput = await client.send(
        new GetObjectCommand({
          Bucket: BUCKET_B2,
          Key: 'links.json',
       })
    )
    const cachedLinksData = getReadableData(cachedLinksOutput.Body)
    cachedLinks = await cachedLinksData.then((tracks) => JSON.parse(tracks)).catch()
```

I then merge the cached links with my newly fetched links and deduplicate them based on the unique `id` from Readwise's API:

```javascript
const filterDuplicates = array => {
  const seenIds = new Set();
  return array.filter(obj => !seenIds.has(obj.id) && seenIds.add(obj.id));
};
...
const mergedData = filterDuplicates([
      ...formatLinkData(fullData).filter((link) => link.tags.includes('share')),
      ...Object.values(cachedLinks)
    ])

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_B2,
        Key: 'links.json',
        Body: JSON.stringify(mergedData),
      })
     )
    return mergedData
```

For the sake of making pagination a bit easier and output more consistent, I've reduced the link display to a title, linking out to what I've shared and a snippet crediting the author. With ~200 links shared so far and 30 per page, this yields 7 pages and will persist the shared links without having to page through Readwise's API quite so aggressively.

My full `_data/links.js` file looks like this:

```javascript
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

const filterDuplicates = array => {
  const seenIds = new Set();
  return array.filter(obj => !seenIds.has(obj.id) && seenIds.add(obj.id));
};

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
      id: link['id']
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
    const mergedData = filterDuplicates([
      ...formatLinkData(fullData).filter((link) => link.tags.includes('share')),
      ...Object.values(cachedLinks)
    ])

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
```