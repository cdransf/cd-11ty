import { getStore } from '@netlify/blobs'
import fs from 'fs'

export const onPreBuild = async ({ constants }) => {
  console.log(constants)
  const scrobbles = getStore('scrobbles', {
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  })
  const artists = getStore('artists', {
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
  })
  const albums = getStore('albums', {
    siteID: constants.SITE_ID,
    token: constants.NETLIFY_API_TOKEN,
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