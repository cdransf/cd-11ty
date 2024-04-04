import { getStore } from '@netlify/blobs'
import fs from 'fs'

export const onPreBuild = async ({ constants }) => {
  const scrobbles = getStore({
    name: 'scrobbles',
    options: {
      siteID: constants.SITE_ID,
      token: constants.NETLIFY_API_TOKEN,
    }
  })
  const artists = getStore({
    name: 'artists',
    options: {
      siteID: constants.SITE_ID,
      token: constants.NETLIFY_API_TOKEN,
    }
  })
  const albums = getStore({
    name: 'albums',
    options: {
      siteID: constants.SITE_ID,
      token: constants.NETLIFY_API_TOKEN,
    }
  })
  const windowData = await scrobbles.get('window', { type: 'json'})
  const artistsMap = await artists.get('artists-map', { type: 'json' })
  const albumsMap = await albums.get('albums-map', { type: 'json' })
  const nowPlaying = await scrobbles.get('now-playing', { type: 'json'})

  console.log(artistsMap)
  console.log(albumsMap)

  fs.writeFileSync('/src/_data/json/scrobbles-window.json', windowData)
  fs.writeFileSync('/src/_data/json/artists-map.json', artistsMap)
  fs.writeFileSync('/src/_data/json/albums-map.json', albumsMap)
  fs.writeFileSync('/src/_data/json/now-playing.json', nowPlaying)
}