---
date: '2023-02-18'
title: 'Adding client side webmentions to my Next.js blog'
description: "The latest iteration of my website is built on Next.js, specifically Timothy Lin's wonderful Tailwind/Next.js starter blog.."
draft: false
tags: ['Next.js', 'React', 'development', 'indie web', 'API']
---

The latest iteration of my website is built on [Next.js](https://nextjs.org), specifically [Timothy Lin](https://github.com/timlrx)'s wonderful [Tailwind/Next.js starter blog.](https://github.com/timlrx/tailwind-nextjs-starter-blog).<!-- excerpt --> I've modified it quite a bit, altering the color scheme, dropping components like analytics, comments and a few others while also building out some new pages (like my [now page](https://coryd.dev/now)). As part of this process I wanted to add support for webmentions to the template, integrating mentions from Mastodon, Medium.com and other available sources.

To kick this off you'll need to log in and establish an account with [webmention.io](https://webmention.io) and [Bridgy](https://brid.gy). The former provides you with a pair of meta tags that collect webmentions, the latter connects your site to social media[^1]

Once you've added the appropriate tags from webmention.io, connected your desired accounts to Bridgy and received some mentions on these sites, you should be able to access said mentions via their API. For my purposes (and yours should you choose to take the same approach), this looks like the following Next.js API route:

```typescript
import loadWebmentions from '@/lib/webmentions'

export default async function handler(req, res) {
  const target = req.query.target
  const response = await loadWebmentions(target)
  res.json(response)
}
```

You can see my mentions at the live route [here](https://coryd.dev/api/webmentions).

I've elected to render mentions of my posts (boosts, in Mastodon's parlance), likes and comments. For boosts, I'm rendering the count, for likes I render the avatar and for mentions I render the comment in full. The component that handles this looks like the following:

```jsx
import siteMetadata from '@/data/siteMetadata'
import { Heart, Rocket } from '@/components/icons'
import { Spin } from '@/components/Loading'
import { useRouter } from 'next/router'
import { useJson } from '@/hooks/useJson'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/utils/formatters'

const WebmentionsCore = () => {
  const { asPath } = useRouter()
  const { response, error } = useJson(`/api/webmentions?target=${siteMetadata.siteUrl}${asPath}`)
  const webmentions = response?.children
  const hasLikes = webmentions?.filter((mention) => mention['wm-property'] === 'like-of').length > 0
  const hasComments =
    webmentions?.filter((mention) => mention['wm-property'] === 'in-reply-to').length > 0
  const boostsCount = webmentions?.filter(
    (mention) => mention['wm-property'] === 'repost-of' || mention['wm-property'] === 'mention-of'
  ).length
  const hasBoosts = boostsCount > 0
  const hasMention = hasLikes || hasComments || hasBoosts

  if (error) return null
  if (!response) return <Spin className="my-2 flex justify-center" />

  const Boosts = () => {
    return (
      <div className="flex flex-row items-center">
        <div className="mr-2 h-5 w-5">
          <Rocket />
        </div>
        {` `}
        <span className="text-sm">{boostsCount}</span>
      </div>
    )
  }

  const Likes = () => (
    <>
      <div className="flex flex-row items-center">
        <div className="mr-2 h-5 w-5">
          <Heart />
        </div>
        <ul className="ml-2 flex flex-row">
          {webmentions?.map((mention) => {
            if (mention['wm-property'] === 'like-of')
              return (
                <li key={mention['wm-id']} className="-ml-2">
                  <Link href={mention.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      className="h-10 w-10 rounded-full border border-blue-500 dark:border-gray-500"
                      src={mention.author.photo}
                      alt={mention.author.name}
                      width="40"
                      height="40"
                    />
                  </Link>
                </li>
              )
          })}
        </ul>
      </div>
    </>
  )

  const Comments = () => {
    return (
      <>
        {webmentions?.map((mention) => {
          if (mention['wm-property'] === 'in-reply-to') {
            return (
              <Link
                className="border-bottom flex flex-row items-center border-gray-100 pb-4"
                key={mention['wm-id']}
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="h-12 w-12 rounded-full border border-blue-500 dark:border-gray-500"
                  src={mention.author.photo}
                  alt={mention.author.name}
                  width="48"
                  height="48"
                />
                <div className="ml-3">
                  <p className="text-sm">{mention.content?.text}</p>
                  <p className="mt-1 text-xs">{formatDate(mention.published)}</p>
                </div>
              </Link>
            )
          }
        })}
      </>
    )
  }

  return (
    <>
      {hasMention ? (
        <div className="text-gray-500 dark:text-gray-100">
          <h4 className="pt-3 text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:text-2xl md:leading-10 ">
            Webmentions
          </h4>
          {hasBoosts ? (
            <div className="pt-2 pb-4">
              <Boosts />
            </div>
          ) : null}
          {hasLikes ? (
            <div className="pt-2 pb-4">
              <Likes />
            </div>
          ) : null}
          {hasComments ? (
            <div className="pt-2 pb-4">
              <Comments />
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

export default WebmentionsCore
```

We derive the post URL from the fixed site URL in my site metadata, the URI from Next.js' router, concatenate them and pass them as the API path to my `useJson` hook, which wraps `useSWR`[^2]:

```typescript
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const useJson = (url: string, props?: any) => {
  const [response, setResponse] = useState<any>({})

  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => res.json())
      .catch()
  const { data, error } = useSWR(url, fetcher, { fallbackData: props, refreshInterval: 30000 })

  useEffect(() => {
    setResponse(data)
  }, [data, setResponse])

  return {
    response,
    error,
  }
}
```

The `target` param narrows the returned mentions to those pertinent to the current post. Once we've received the appropriate response from the service, we evaluate the data to determine what types of mentions we have, construct JSX components to display them and conditionally render them based on the presence of the appropriate mention data.

The `WebmentionsCore` component is dynamically loaded into each post using the following parent component:

```jsx
import dynamic from 'next/dynamic'
import { Spin } from '@/components/Loading'

const Webmentions = dynamic(() => import('@/components/webmentions/WebmentionsCore'), {
  ssr: false,
  loading: () => <Spin className="my-2 flex justify-center" />,
})

export default Webmentions
```

The final display looks like this:

<img src="https://files.coryd.dev/v/NG8lHj24OsJilx7QuxWO+" alt="Example webmentions" style="width:100%;height:auto;margin:.5em 0" />

[^1]: For my purposes, social media is GitHub, Mastodon and Medium. I've used the rest at various points and no longer have an interest in them for myriad reasons.
[^2]: I've discussed this all a bit more in [this post](https://coryd.dev/blog/simple-api-fetch-hooks-with-swr).
