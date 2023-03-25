---
title: 'Simple data fetching with custom React hooks and SWR'
date: '2022-05-23'
draft: false
tags: [swr, api, fetch, react, nextjs]
---

My site was scaffolded out using [Timothy Lin](https://github.com/timlrx)'s [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) project (which I highly recommend checking out). As part of the build out I wanted to display the books I'm currently reading and the song I most recently listened to, data available from [oku](https://oku.club) and [Last.fm](https://last.fm), respectively.<!-- excerpt -->[^1] I've added the display for this data to the top of the home page using a pair of light-weight React components.

To fetch the data for these components I elected to leverage [vercel/swr](https://github.com/vercel/swr), described as:

> SWR is a React Hooks library for data fetching.
>
> The name "**SWR**" is derived from `stale-while-revalidate`, a cache invalidation strategy popularized by [HTTP RFC 5861](https://tools.ietf.org/html/rfc5861). **SWR** first returns the data from cache (stale), then sends the request (revalidate), and finally comes with the up-to-date data again.

On oku, each collection page contains an RSS feed exposing the data for that page. To retrieve and parse the data for my [reading](https://oku.club/user/cory/collection/reading) collection, I'm leveraging [feed-reader](https://www.npmjs.com/package/feed-reader) and passing it to the `useSWR` hook exposed by `swr`. This looks like the following:

```typescript
import { read } from 'feed-reader'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const useRss = (url: string) => {
    const [response, setResponse] = useState([])

    const fetcher = (url: string) =>
        read(url)
            .then((res) => res.entries)
            .catch()
    const { data, error } = useSWR(url, fetcher)

    useEffect(() => {
        setResponse(data)
    }, [data, setResponse])

    return {
        response,
        error,
    }
}
```

This is then implemented in a `reading.tsx` component as follows[^2]:

```typescript
const { response, error } = useRss('/books')
```

Similarly, I've implemented a hook to fetch json using, well, `fetch` and that looks like the following:

```typescript
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const useJson = (url: string) => {
    const [response, setResponse] = useState<any>({})

    const fetcher = (url: string) =>
        fetch(url)
            .then((res) => res.json())
            .catch()
    const { data, error } = useSWR(url, fetcher)

    useEffect(() => {
        setResponse(data)
    }, [data, setResponse])

    return {
        response,
        error,
    }
}
```

This is then implemented in a `music.tsx` component as follows[^3]:

```typescript
const { response, error } = useJson('/api/music')
```

The `useJson` hook only supports `GET` requests at this point but, could, with a little effort, be refactored to support parameters passed through to the enclosed `fetch` call. This could be done by updating the interface to accept a `parameters` object that includes the url to be called or by adding a separate, optional `parameters` object. I would lean towards the latter approach as the usage would only become as complex as a specific implementation requires.

Both of these components are visible at [coryd.dev](https://coryd.dev). The loading state is displayed until `response` is valid and `null` is returned in the event an `error` occurs as returned by the hook.

[^1]: For the request to oku, I've configured a rewrite in `next.config.js`; for last.fm I've added a simple `api/music.ts` route that interpolates my private API key stored in my Vercel environment variables.
[^2]: The full `reading.tsx` implementation can be [viewed here](https://github.com/cdransf/coryd.dev/blob/1b33bfdc88bbef27e5916971e5db15aa600299d7/components/media/reading.tsx).
[^3]: The full `music.tsx` implementation can be [viewed here](https://github.com/cdransf/coryd.dev/blob/c2577e08e659ce739ab360f25cf5424c6e3ed922/components/media/music.tsx).
