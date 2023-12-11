---
date: '2023-02-23'
title: 'Automating RSS syndication and sharing with Next.js and GitHub'
description: 'I wrote a basic syndication tool in Next.js to automate sharing items from configured RSS feeds to Mastodon. This tool works by leveraging a few basic configurations, the Mastodon API and a (reasonably) lightweight script that creates a JSON cache when initialized and posts new items on an hourly basis.'
draft: false
tags: ['Next.js', 'RSS', 'automation', 'GitHub']
---

I wrote a basic syndication tool in Next.js to automate sharing items from configured RSS feeds to Mastodon. This tool works by leveraging a few basic configurations, the Mastodon API and a (reasonably) lightweight script that creates a JSON cache when initialized and posts new items on an hourly basis.<!-- excerpt -->

The script that handles this functionality lives at `lib/syndicate/index.ts`:

```typescript
import { toPascalCase } from '@/utils/formatters'
import { extract, FeedEntry } from '@extractus/feed-extractor'
import { SERVICES, TAGS } from './config'
import createMastoPost from './createMastoPost'

export default async function syndicate(init?: string) {
  const TOKEN_CORYDDEV_GISTS = process.env.TOKEN_CORYDDEV_GISTS
  const GIST_ID_SYNDICATION_CACHE = '406166f337b9ed2d494951757a70b9d1'
  const GIST_NAME_SYNDICATION_CACHE = 'syndication-cache.json'
  const CLEAN_OBJECT = () => {
    const INIT_OBJECT = {}
    Object.keys(SERVICES).map((service) => (INIT_OBJECT[service] = []))
    return INIT_OBJECT
  }

  async function hydrateCache() {
    const CACHE_DATA = CLEAN_OBJECT()
    for (const service in SERVICES) {
      const data = await extract(SERVICES[service])
      const entries = data?.entries
      entries.map((entry: FeedEntry) => CACHE_DATA[service].push(entry.id))
    }
    await fetch(`https://api.github.com/gists/${GIST_ID_SYNDICATION_CACHE}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN_CORYDDEV_GISTS}`,
        'Content-Type': 'application/vnd.github+json',
      },
      body: JSON.stringify({
        gist_id: GIST_ID_SYNDICATION_CACHE,
        files: {
          'syndication-cache.json': {
            content: JSON.stringify(CACHE_DATA),
          },
        },
      }),
    })
      .then((response) => response.json())
      .catch((err) => console.log(err))
  }

  const DATA = await fetch(`https://api.github.com/gists/${GIST_ID_SYNDICATION_CACHE}`).then(
    (response) => response.json()
  )
  const CONTENT = DATA?.files[GIST_NAME_SYNDICATION_CACHE].content

  // rewrite the sync data if init is reset
  if (CONTENT === '' || init === 'true') hydrateCache()

  if (CONTENT && CONTENT !== '' && !init) {
    const existingData = await fetch(
      `https://api.github.com/gists/${GIST_ID_SYNDICATION_CACHE}`
    ).then((response) => response.json())
    const existingContent = JSON.parse(existingData?.files[GIST_NAME_SYNDICATION_CACHE].content)

    for (const service in SERVICES) {
      const data = await extract(SERVICES[service], {
        getExtraEntryFields: (feedEntry) => {
          return {
            tags: feedEntry['cd:tags'],
          }
        },
      })
      const entries: (FeedEntry & { tags?: string })[] = data?.entries
      if (!existingContent[service].includes(entries[0].id)) {
        let tags = ''
        if (entries[0].tags) {
          entries[0].tags
            .split(',')
            .forEach((a, index) =>
              index === 0 ? (tags += `#${toPascalCase(a)}`) : (tags += ` #${toPascalCase(a)}`)
            )
          tags += ` ${TAGS[service]}`
        } else {
          tags = TAGS[service]
        }
        existingContent[service].push(entries[0].id)
        createMastoPost(`${entries[0].title} ${entries[0].link} ${tags}`)
        await fetch(`https://api.github.com/gists/${GIST_ID_SYNDICATION_CACHE}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${TOKEN_CORYDDEV_GISTS}`,
            'Content-Type': 'application/vnd.github+json',
          },
          body: JSON.stringify({
            gist_id: GIST_ID_SYNDICATION_CACHE,
            files: {
              'syndication-cache.json': {
                content: JSON.stringify(existingContent),
              },
            },
          }),
        })
          .then((response) => response.json())
          .catch((err) => console.log(err))
      }
    }
  }
}
```

We start off with an optional `init` parameter that can be passed into our `syndicate` function to hydrate our syndication cache — the structure of this cache is essentially `SERIVCE_KEY: string[]` where `string[]` contains RSS post IDs. Now, given that Vercel is intended as front end hosting, I needed a reasonably simple and reliable solution for hosting a simple JSON object. I explored and didn't want to involve a full-fledged database or storage solution and wasn't terribly interested in dealing with S3 or B2 for this purpose, so I, instead, went with a "secret" GitHub gist[^1] and leveraged the GitHub API for storage. At each step of the [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) process in this script we make a call to the GitHub API using a token for authentication, deal with the returned JSON and go on our merry way.

Once the cache is hydrated the script will check the feeds available in `lib/syndicate/config.ts` and post the most recent item if it does not exist in the cache and then add it to said cache. The configured services are simply:

```typescript
export const SERVICES = {
  'coryd.dev': 'https://coryd.dev/feed.xml',
  glass: 'https://glass.photo/coryd/rss',
  letterboxd: 'https://letterboxd.com/cdme/rss/',
}
```

As we iterate through this object we also attach tags specific to each service using an object shaped exactly like `SERVICES` in `config.ts`:

```typescript
export const TAGS = {
  'coryd.dev': '#Blog',
  glass: '#Photo #Glass',
  letterboxd: '#Movie #Letterboxd',
}
```

This is partly for discovery and partly a consistent way for folks to filter my automated nonsense should they so choose. The format of Glass and Letterboxd are consistent and the tags are as well — for posts from my site (like this one 👋🏻) I start with `#Blog` and have also modified the structure of my RSS feed to expose the tags I add to each post. The feed is generated by a script that runs at build time called `generate-rss.ts` which looks like:

```typescript
import { escape } from '@/lib/utils/htmlEscaper'
import siteMetadata from '@/data/siteMetadata'
import { PostFrontMatter } from 'types/PostFrontMatter'

const generateRssItem = (post: PostFrontMatter) => `
    <item>
        <guid>${siteMetadata.siteUrl}/blog/${post.slug}</guid>
        <title>${escape(post.title)}</title>
        <link>${siteMetadata.siteUrl}/blog/${post.slug}</link>
        ${post.summary && `<description>${escape(post.summary)}</description>`}
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <author>${siteMetadata.email} (${siteMetadata.author})</author>
        ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
        <cd:tags>${post.tags}</cd:tags>
    </item>
`

const generateRss = (posts: PostFrontMatter[], page = 'feed.xml') => `
    <rss version="2.0"
        xmlns:cd="https://coryd.dev/rss"
        xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
            <title>${escape(siteMetadata.title)}</title>
            <link>${siteMetadata.siteUrl}/blog</link>
            <description>${escape(siteMetadata.description.default)}</description>
            <language>${siteMetadata.language}</language>
            <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
            <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
            <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
            <atom:link href="${
              siteMetadata.siteUrl
            }/${page}" rel="self" type="application/rss+xml"/>
            ${posts.map(generateRssItem).join('')}
        </channel>
    </rss>
`
export default generateRss
```

I've added a new namespace to the parent `<rss...>` tag called `cd`[^2] — the declaration points to a page at this site that (very) briefly explains the purpose, I then created a `<cd:tags>` field that exposes a comma delimited list of post tags.

Back in `syndicate/index.ts`, this field is accessed when the RSS feed is parsed:

```typescript
const data = await extract(SERVICES[service], {
    getExtraEntryFields: (feedEntry) => {
        return {
            tags: feedEntry['cd:tags'],
        }
    },
})
...
let tags = ''
if (entries[0].tags) {
    entries[0].tags
        .split(',')
        .forEach((a, index) =>
            index === 0
                ? (tags += `#${toPascalCase(a)}`)
                : (tags += ` #${toPascalCase(a)}`)
        )
    tags += ` ${TAGS[service]}`
} else {
    tags = TAGS[service]
}
```

Tags get transformed to Pascal case, prepended with `#` and sent off to be posted to Mastodon along with the static service-specific tags.

The function that posts content to Mastodon is as simple as the following:

```typescript
import { MASTODON_INSTANCE } from './config'
const KEY = process.env.API_KEY_MASTODON

const createMastoPost = async (content: string) => {
  const formData = new FormData()
  formData.append('status', content)

  const res = await fetch(`${MASTODON_INSTANCE}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: formData,
  })
  return res.json()
}

export default createMastoPost
```

Back at GitHub, this is all kicked off every hour on the hour using the following workflow:

```yaml
name: scheduled-cron-job
on:
  schedule:
    - cron: '0 * * * *'
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: scheduled-cron-job
        run: |
          curl -X POST 'https://coryd.dev/api/syndicate' \
          -H 'Authorization: Bearer ${{ secrets.VERCEL_SYNDICATE_KEY }}'
```

Now, as I post things elsewhere, they'll make their way back to Mastodon with a simple title, link and tag set. Read them if you'd like, or filter them out altogether.

[^1]: It's secret inasmuch as it's obscured and, hence, not secured (which is also why `syndicate.ts` includes the gist ID directly) — it's all public post IDs, so peruse as one sees fit.
[^2]: Not very creative, I know.
