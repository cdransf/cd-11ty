---
title: 'Building a now page using Next.js and social APIs'
date: 2023-02-20
draft: false
tags: ['Next.js', 'React', 'API']
---

With my personal site now sitting at Vercel and written in Next.js I decided to rework my [now](https://coryd.dev/now) page by leveraging a variety of social APIs. I kicked things off by looking through various platforms I use regularly and tracking down those that provide either API access or RSS feeds. For those with APIs I wrote code to access my data via said APIs, for those with feeds only I've leveraged [@extractus/feed-extractor](https://www.npmjs.com/package/@extractus/feed-extractor) to transform them to JSON responses.<!-- excerpt -->

The `/now` template in my `pages` directory looks like the following:

```jsx
import siteMetadata from '@/data/siteMetadata'
import loadNowData from '@/lib/now'
import { useJson } from '@/hooks/useJson'
import Link from 'next/link'
import { PageSEO } from '@/components/SEO'
import { Spin } from '@/components/Loading'
import {
  MapPinIcon,
  CodeBracketIcon,
  MegaphoneIcon,
  CommandLineIcon,
} from '@heroicons/react/24/solid'
import Status from '@/components/Status'
import Albums from '@/components/media/Albums'
import Artists from '@/components/media/Artists'
import Reading from '@/components/media/Reading'
import Movies from '@/components/media/Movies'
import TV from '@/components/media/TV'

const env = process.env.NODE_ENV
let host = siteMetadata.siteUrl
if (env === 'development') host = 'http://localhost:3000'

export async function getStaticProps() {
  return {
    props: await loadNowData('status,artists,albums,books,movies,tv'),
    revalidate: 3600,
  }
}

export default function Now(props) {
  const { response, error } = useJson(`${host}/api/now`, props)
  const { status, artists, albums, books, movies, tv } = response

  if (error) return null
  if (!response) return <Spin className="my-2 flex justify-center" />

  return (
    <>
      <PageSEO title={`Now - ${siteMetadata.author}`} description={siteMetadata.description.now} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Now
          </h1>
        </div>
        <div className="pt-12">
          <h3 className="text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14">
            Currently
          </h3>
          <div className="pl-5 md:pl-10">
            <Status status={status} />
            <p className="mt-2 text-lg leading-7 text-gray-500 dark:text-gray-100">
              <MapPinIcon className="mr-1 inline h-6 w-6" />
              Living in Camarillo, California with my beautiful family, 4 rescue dogs and a guinea pig.
            </p>
            <p className="mt-2 text-lg leading-7 text-gray-500 dark:text-gray-100">
              <CodeBracketIcon className="mr-1 inline h-6 w-6" />
              Working at <Link
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                href="https://hashicorp.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                HashiCorp
              </Link>
            </p>
            <p className="mt-2 text-lg leading-7 text-gray-500 dark:text-gray-100">
              <MegaphoneIcon className="mr-1 inline h-6 w-6" />
              Rooting for the{` `}
              <Link
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                href="https://lakers.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lakers
              </Link>
              , for better or worse.
            </p>
          </div>
          <h3 className="pt-6 text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14">
            Making
          </h3>
          <div className="pl-5 md:pl-10">
            <p className="mt-2 text-lg leading-7 text-gray-500 dark:text-gray-100">
              <CommandLineIcon className="mr-1 inline h-6 w-6" />
              Hacking away on random projects like this page, my <Link
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                href="/blog"
                passHref
              >
                blog
              </Link> and whatever else I can find time for.
            </p>
          </div>
          <Artists artists={artists} />
          <Albums albums={albums} />
          <Reading books={books} />
          <Movies movies={movies} />
          <TV tv={tv} />
          <p className="pt-8 text-center text-xs text-gray-900 dark:text-gray-100">
            (This is a{' '}
            <Link
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              now page
            </Link>
            , and if you have your own site, <Link
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              you should make one, too
            </Link>
            .)
          </p>
        </div>
      </div>
    </>
  )
}
```

You'll see that the top section is largely static, with text styled using Tailwind and associated icons from the [Hero Icons](https://heroicons.com) package. We're also exporting an instance of `getStaticProps` that's revalidated every hour and makes a call to a method exposed from my `lib` directory called `loadNowData`. `loadNowData` takes a comma delimited string as an argument to indicate which properties I want returned in the composed object from that method[^1]. The method looks like this[^2]:

```typescript
import { extract } from '@extractus/feed-extractor'
import siteMetadata from '@/data/siteMetadata'
import { Albums, Artists, Status, TransformedRss } from '@/types/api'
import { Tracks } from '@/types/api/tracks'

export default async function loadNowData(endpoints?: string) {
  const selectedEndpoints = endpoints?.split(',') || null
  const TV_KEY = process.env.API_KEY_TRAKT
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const env = process.env.NODE_ENV
  let host = siteMetadata.siteUrl
  if (env === 'development') host = 'http://localhost:3000'

  let statusJson = null
  let artistsJson = null
  let albumsJson = null
  let booksJson = null
  let moviesJson = null
  let tvJson = null
  let currentTrackJson = null

  // status
  if ((endpoints && selectedEndpoints.includes('status')) || !endpoints) {
    const statusUrl = 'https://api.omg.lol/address/cory/statuses/'
    statusJson = await fetch(statusUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.log(error)
        return {}
      })
  }

  // artists
  if ((endpoints && selectedEndpoints.includes('artists')) || !endpoints) {
    const artistsUrl = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=cdme_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
    artistsJson = await fetch(artistsUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.log(error)
        return {}
      })
  }

  // albums
  if ((endpoints && selectedEndpoints.includes('albums')) || !endpoints) {
    const albumsUrl = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=cdme_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
    albumsJson = await fetch(albumsUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.log(error)
        return {}
      })
  }

  // books
  if ((endpoints && selectedEndpoints.includes('books')) || !endpoints) {
    const booksUrl = `${host}/feeds/books`
    booksJson = await extract(booksUrl).catch((error) => {
      console.log(error)
      return {}
    })
  }

  // movies
  if ((endpoints && selectedEndpoints.includes('movies')) || !endpoints) {
    const moviesUrl = `${host}/feeds/movies`
    moviesJson = await extract(moviesUrl).catch((error) => {
      console.log(error)
      return {}
    })
    moviesJson.entries = moviesJson.entries.splice(0, 5)
  }

  // tv
  if ((endpoints && selectedEndpoints.includes('tv')) || !endpoints) {
    const tvUrl = `${host}/feeds/tv?slurm=${TV_KEY}`
    tvJson = await extract(tvUrl).catch((error) => {
      console.log(error)
      return {}
    })
    tvJson.entries = tvJson.entries.splice(0, 5)
  }

  // current track
  if ((endpoints && selectedEndpoints.includes('currentTrack')) || !endpoints) {
    const currentTrackUrl = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=cdme_&api_key=${MUSIC_KEY}&limit=1&format=json&period=7day`
    currentTrackJson = await fetch(currentTrackUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.log(error)
        return {}
      })
  }

  const res: {
    status?: Status
    artists?: Artists
    albums?: Albums
    books?: TransformedRss
    movies?: TransformedRss
    tv?: TransformedRss
    currentTrack?: Tracks
  } = {}
  if (statusJson) res.status = statusJson.response.statuses.splice(0, 1)[0]
  if (artistsJson) res.artists = artistsJson?.topartists.artist
  if (albumsJson) res.albums = albumsJson?.topalbums.album
  if (booksJson) res.books = booksJson?.entries
  if (moviesJson) res.movies = moviesJson?.entries
  if (tvJson) res.tv = tvJson?.entries
  if (currentTrackJson) res.currentTrack = currentTrackJson?.recenttracks?.track?.[0]

  // unified response
  return res
}
```

The individual media components of the now page are simple and presentational, for example, `Albums.tsx`:

```jsx
import Cover from '@/components/media/display/Cover'
import { Spin } from '@/components/Loading'
import { Album } from '@/types/api'

const Albums = (props: { albums: Album[] }) => {
  const { albums } = props

  if (!albums) return <Spin className="my-12 flex justify-center" />

  return (
    <>
      <h3 className="pt-4 pb-4 text-xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-4xl md:leading-14">
        Listening: albums
      </h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {albums?.map((album) => (
          <Cover key={album.mbid} media={album} type="album" />
        ))}
      </div>
    </>
  )
}

export default Albums
```

This component and `Artists.tsx` leverage `Cover.tsx`, which renders music related elements:

```tsx
import { Media } from '@/types/api'
import ImageWithFallback from '@/components/ImageWithFallback'
import Link from 'next/link'
import { ALBUM_DENYLIST } from '@/utils/constants'

const Cover = (props: { media: Media; type: 'artist' | 'album' }) => {
  const { media, type } = props
  const image = (media: Media) => {
    let img = ''
    if (type === 'album')
      img = !ALBUM_DENYLIST.includes(media.name.replace(/\s+/g, '-').toLowerCase())
        ? media.image[media.image.length - 1]['#text']
        : `/media/artists/${media.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
    if (type === 'artist')
      img = `/media/artists/${media.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
    return img
  }

  return (
    <Link
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      title={media.name}
    >
      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-full rounded-lg border border-primary-500 bg-cover-gradient dark:border-gray-500"></div>
        <div className="absolute left-1 bottom-2 drop-shadow-md">
          <div className="px-1 text-xs font-bold text-white">{media.name}</div>
          <div className="px-1 text-xs text-white">
            {type === 'album' ? media.artist.name : `${media.playcount} plays`}
          </div>
        </div>
        <ImageWithFallback
          src={image(media)}
          alt={media.name}
          className="rounded-lg"
          width="350"
          height="350"
        />
      </div>
    </Link>
  )
}

export default Cover
```

All of the components for this page [can be viewed on GitHub](https://github.com/cdransf/coryd.dev/tree/main/components/media). Each one consumes an object from the `loadNowData` object and renders it to the page. The page is also periodically revalidated via an api route that simply calls this same method:

```ts
import loadNowData from '@/lib/now'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')

  const endpoints = req.query.endpoints
  const response = await loadNowData(endpoints)
  res.json(response)
}
```

And, with all of that in place, we have a lightly trafficked page that updates itself (with a few exceptions) as I go about my habits of using Last.fm, Trakt, Letterboxd, Oku and so forth.

[^1]: I know about GraphQL, but we're just going to deal with plain old fetch calls here.
[^2]: It's also leveraged on the index view of my site to fetch my status, currently playing track and the books I'm currently reading.
