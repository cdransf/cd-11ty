import { getDeployStore } from '@netlify/blobs'
import fs from 'fs'

export const onPreBuild = async ({ constants }) => {
  const store = getDeployStore({
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  });
  const scrobbles = store.get('scrobbles')
  const artists = store.get('artists')
  const albums = store.get('albums')
  const windowData = await scrobbles.get('window', { type: 'json'})
  const artistsMap = await artists.get('artists-map', { type: 'json' })
  const albumsMap = await albums.get('albums-map', { type: 'json' })
  const nowPlaying = await scrobbles.get('now-playing', { type: 'json'})

  console.log(windowData)

  fs.writeFileSync('/src/_data/json/scrobbles-window.json', windowData)
  fs.writeFileSync('/src/_data/json/artists-map.json', artistsMap)
  fs.writeFileSync('/src/_data/json/albums-map.json', albumsMap)
  fs.writeFileSync('/src/_data/json/now-playing.json', nowPlaying)
}