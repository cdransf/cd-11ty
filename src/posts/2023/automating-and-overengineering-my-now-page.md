---
title: 'Automating (and probably overengineering) my /now page'
date: '2023-02-06'
draft: false
tags: ['automation', 'development', 'Next.js', 'JavaScript']
---

[omg.lol](https://home.omg.lol) (where I point my domain) and host most of my site content [recently launched support for /now pages](https://omglol.news/2023/01/16/now-pages-are-here).<!-- excerpt -->

**[nownownow.com](https://nownownow.com)**

> ...a link that says "**now**" goes to a page that tells you **what this person is focused on at this point in their life.** For short, we call it a "now page".

This page can be updated manually but, as with just about everything offered by omg.lol, there's an API to submit updates to the page. I already blog infrequently and knew I would fail to manually update the page frequently, which presented an opportunity to automate updates to the page. My page is available at [coryd.dev/now](https://coryd.dev/now).

Borrowing from [Robb Knight](https://rknight.me) I started by creating a paste containing `yaml` with static text to fill out the top of my now page with brief details about family, work and hobbies (or lack thereof).

From there, I turned to the myriad content-based services I use to track what I'm listening to, what TV and movies I'm watching and what books I'm reading to source updates from.

I'm already exposing my most recently listened tracks and actively read books on my omg.lol home page/profile. This data is fetched from a [Next.js](https://nextjs.org) application hosted over at [Vercel](https://vercel.com) that exposes a number of endpoints. For my music listening data, I'm using a route at `/api/music` that looks like this:

```typescript
export default async function handler(req: any, res: any) {
  const KEY = process.env.API_KEY_LASTFM
  const METHODS: { [key: string]: string } = {
    default: 'user.getrecenttracks',
    albums: 'user.gettopalbums',
    artists: 'user.gettopartists',
  }
  const METHOD = METHODS[req.query.type] || METHODS['default']
  const data = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=${METHOD}&user=cdme_&api_key=${KEY}&limit=${
      req.query.limit || 20
    }&format=${req.query.format || 'json'}&period=${req.query.period || 'overall'}`
  ).then((response) => response.json())
  res.json(data)
}
```

This API takes a type parameter and passes through several of Last.fm's stock parameters to allow it to be reused for my now listening display and the `/now` page.

Last.fm's API returns album images, but no longer returns artist images. To solve this, I've created an `/api/media` endpoint that checks for an available, static artist image and returns a placeholder if that check yields a 404. If a 404 is returned, I'm logging the missing artist name to a paste at omg.lol's paste.lol service:

```typescript
import siteMetadata from '@/data/siteMetadata'

export default async function handler(req: any, res: any) {
  const env = process.env.NODE_ENV
  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'
  const ARTIST = req.query.artist
  const ALBUM = req.query.album
  const MEDIA = ARTIST ? 'artists' : 'albums'
  const MEDIA_VAL = ARTIST ? ARTIST : ALBUM

  const data = await fetch(`${host}/media/${MEDIA}/${MEDIA_VAL}.jpg`)
    .then((response) => {
      if (response.status === 200) return `${host}/media/${MEDIA}/${MEDIA_VAL}.jpg`
      fetch(
        `${host}/api/omg/paste-edit?paste=404-images&editType=append&content=${MEDIA_VAL}`
      ).then((response) => response.json())
      return `${host}/media/404.jpg`
    })
    .then((image) => image)
  res.redirect(data)
}
```

For my reading data, Oku.club exposes an [RSS feed](https://en.wikipedia.org/wiki/RSS) for all collection views. I'm using [@extractus/feed-extractor](https://www.npmjs.com/package/@extractus/feed-extractor) to transform that RSS feed to JSON and expose it as follows:

```typescript
import { extract } from '@extractus/feed-extractor'
import siteMetadata from '@/data/siteMetadata'

export default async function handler(req: any, res: any) {
  const env = process.env.NODE_ENV
  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'
  const url = `${host}/feeds/books`
  const result = await extract(url)
  res.json(result)
}
```

For television watched data, Trakt offers an RSS feed of my watched history, which is served as an endpoint as follows:

```typescript
import { extract } from '@extractus/feed-extractor'
import siteMetadata from '@/data/siteMetadata'

export default async function handler(req: any, res: any) {
  const KEY = process.env.API_KEY_TRAKT
  const env = process.env.NODE_ENV
  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'
  const url = `${host}/feeds/tv?slurm=${KEY}`
  const result = await extract(url, {
    getExtraEntryFields: (feedEntry) => {
      return {
        image: feedEntry['media:content']['@_url'],
        thumbnail: feedEntry['media:thumbnail']['@_url'],
      }
    },
  })
  res.json(result)
}
```

For movie data from Letterboxd we are, again, looking at transforming my profile RSS feed:

```typescript
import { extract } from '@extractus/feed-extractor'
import siteMetadata from '@/data/siteMetadata'

export default async function handler(req: any, res: any) {
  const env = process.env.NODE_ENV
  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'
  const url = `${host}/feeds/movies`
  const result = await extract(url)
  res.json(result)
}
```

This all comes together in yeat another, perhaps overwrought, endpoint at `/api/now`. Calls to this endpoint are authenticated with a bearer code and each endpoint response is configured to return JSON, Markdown and, in the case of sections with more complex layouts (music artists and albums), HTML. The contents of that endpoint are as follows:

```typescript
import jsYaml from 'js-yaml'
import siteMetadata from '@/data/siteMetadata'
import { listsToMarkdown } from '@/utils/transforms'
import { getRandomIcon } from '@/utils/icons'
import { nowResponseToMarkdown } from '@/utils/transforms'
import { ALBUM_DENYLIST } from '@/utils/constants'

export default async function handler(req: any, res: any) {
  const env = process.env.NODE_ENV
  const { APP_KEY_OMG, API_KEY_OMG } = process.env
  const ACTION_KEY = req.headers.authorization?.split(' ')[1]

  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'

  try {
    if (ACTION_KEY === APP_KEY_OMG) {
      const now = await fetch('https://api.omg.lol/address/cory/pastebin/now.yaml')
        .then((res) => res.json())
        .then((json) => {
          const now = jsYaml.load(json.response.paste.content)
          Object.keys(jsYaml.load(json.response.paste.content)).forEach((key) => {
            now[key] = listsToMarkdown(now[key])
          })

          return { now }
        })

      const books = await fetch(`${host}/api/books`)
        .then((res) => res.json())
        .then((json) => {
          const data = json.entries.slice(0, 5).map((book: { title: string; link: string }) => {
            return {
              title: book.title,
              link: book.link,
            }
          })
          return {
            json: data,
            md: data
              .map((d: any) => {
                return `- [${d.title}](${d.link}) {${getRandomIcon('books')}}`
              })
              .join('\n'),
          }
        })

      const movies = await fetch(`${host}/api/movies`)
        .then((res) => res.json())
        .then((json) => {
          const data = json.entries
            .slice(0, 5)
            .map((movie: { title: string; link: string; description: string }) => {
              return {
                title: movie.title,
                link: movie.link,
                desc: movie.description,
              }
            })
          return {
            json: data,
            md: data
              .map((d: any) => {
                return `- [${d.title}](${d.link}): ${d.desc} {${getRandomIcon('movies')}}`
              })
              .join('\n'),
          }
        })

      const tv = await fetch(`${host}/api/tv`)
        .then((res) => res.json())
        .then((json) => {
          const data = json.entries
            .splice(0, 5)
            .map((episode: { title: string; link: string; image: string; thumbnail: string }) => {
              return {
                title: episode.title,
                link: episode.link,
                image: episode.image,
                thumbnail: episode.thumbnail,
              }
            })
          return {
            json: data,
            html: data
              .map((d: any) => {
                return `<div class="container"><a href=${d.link} title='${d.title} by ${d.artist}'><div class='cover'></div><div class='details'><div class='text-main'>${d.title}</div></div><img src='${d.thumbnail}' alt='${d.title}' /></div></a>`
              })
              .join('\n'),
            md: data
              .map((d: any) => {
                return `- [${d.title}](${d.link}) {${getRandomIcon('tv')}}`
              })
              .join('\n'),
          }
        })

      const musicArtists = await fetch(
        `https://utils.coryd.dev/api/music?type=artists&period=7day&limit=8`
      )
        .then((res) => res.json())
        .then((json) => {
          const data = json.topartists.artist.map((a: any) => {
            return {
              artist: a.name,
              link: `https://rateyourmusic.com/search?searchterm=${encodeURIComponent(a.name)}`,
              image: `${host}/api/media?artist=${a.name.replace(/\s+/g, '-').toLowerCase()}`,
            }
          })
          return {
            json: data,
            html: data
              .map((d: any) => {
                return `<div class="container"><a href=${d.link} title='${d.title} by ${d.artist}'><div class='cover'></div><div class='details'><div class='text-main'>${d.artist}</div></div><img src='${d.image}' alt='${d.artist}' /></div></a>`
              })
              .join('\n'),
            md: data
              .map((d: any) => {
                return `- [${d.artist}](${d.link}) {${getRandomIcon('music')}}`
              })
              .join('\n'),
          }
        })

      const musicAlbums = await fetch(
        `https://utils.coryd.dev/api/music?type=albums&period=7day&limit=8`
      )
        .then((res) => res.json())
        .then((json) => {
          const data = json.topalbums.album.map((a: any) => ({
            title: a.name,
            artist: a.artist.name,
            link: `https://rateyourmusic.com/search?searchterm=${encodeURIComponent(a.name)}`,
            image: !ALBUM_DENYLIST.includes(a.name.replace(/\s+/g, '-').toLowerCase())
              ? a.image[a.image.length - 1]['#text']
              : `${host}/api/media?album=${a.name.replace(/\s+/g, '-').toLowerCase()}`,
          }))
          return {
            json: data,
            html: data
              .map((d: any) => {
                return `<div class="container"><a href=${d.link} title='${d.title} by ${d.artist}'><div class='cover'></div><div class='details'><div class='text-main'>${d.title}</div><div class='text-secondary'>${d.artist}</div></div><img src='${d.image}' alt='${d.title} by ${d.artist}' /></div></a>`
              })
              .join('\n'),
            md: data
              .map((d: any) => {
                return `- [${d.title}](${d.link}) by ${d.artist} {${getRandomIcon('music')}}`
              })
              .join('\n'),
          }
        })

      fetch('https://api.omg.lol/address/cory/now', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${API_KEY_OMG}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: nowResponseToMarkdown({
            now,
            books,
            movies,
            tv,
            music: {
              artists: musicArtists,
              albums: musicAlbums,
            },
          }),
          listed: 1,
        }),
      })

      res.status(200).json({ success: true })
    } else {
      res.status(401).json({ success: false })
    }
  } catch (err) {
    res.status(500).json({ success: false })
  }
}
```

This endpoint also supports a denylist for albums returned from last.fm that might not be appropriate to display in polite company — if an album is in the denylist we look for an alternate, statically hosted cover or serve our 404 placeholder if one isn't readily available.

For items displayed from Markdown I'm attaching a random FontAwesome icon (e.g. `getRandomIcon('music')`):

```typescript
export const getRandomIcon = (type: string) => {
  const icons = {
    books: ['book', 'book-bookmark', 'book-open', 'book-open-reader', 'bookmark'],
    music: ['music', 'headphones', 'record-vinyl', 'radio', 'guitar', 'compact-disc'],
    movies: ['film', 'display', 'video', 'ticket'],
    tv: ['tv', 'display', 'video'],
  }

  return icons[type][Math.floor(Math.random() * (icons[type].length - 1 - 0))]
}
```

As the final step to wrap this up, calls to `/api/now` are made every 8 hours using a GitHub action:

```yaml
name: scheduled-cron-job
on:
  schedule:
    - cron: '0 */8 * * *'
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: scheduled-cron-job
        run: |
          curl -X POST 'https://utils.coryd.dev/api/now' \
          -H 'Authorization: Bearer ${{ secrets.ACTION_KEY }}'
```

This endpoint can also be manually called using another workflow:

```yaml
name: manual-job
on: [workflow_dispatch]
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: manual-job
        run: |
          curl -X POST 'https://utils.coryd.dev/api/now' \
          -H 'Authorization: Bearer ${{ secrets.ACTION_KEY }}'
```

So far this works seamlessly — if I want to update or add static content I can do so via my yaml paste at paste.lol and the change will roll out in due time.

Questions? Comments? Feel free to get in touch:

- [Email](mailto:cory.dransfeldt@gmail.com)
- [Mastodon](https://social.lol/@cory)

---

Robb Knight has a [great post](https://rknight.me/automating-my-now-page/) on his process for automating his `/now` page using [Eleventy](https://www.11ty.dev) and mirroring it to omg.lol.
