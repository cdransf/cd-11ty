import { getStore } from '@netlify/blobs'
import { DateTime } from 'luxon'

const sanitizeMediaString = (string) => string.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')

const weekKey = () => {
  const currentDate = DateTime.now();
  return `${currentDate.year}-${currentDate.weekNumber}`
}

const filterOldScrobbles = (scrobbles) => {
  const windowEnd = DateTime.now().minus({ days: 7 });
  return scrobbles.filter(scrobble => {
    const timestamp = DateTime.fromISO(scrobble.timestamp);
    return timestamp >= windowEnd;
  });
}

export default async (request) => {
  const ACCOUNT_ID_PLEX = Netlify.env.get('ACCOUNT_ID_PLEX');
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM');
  const params = new URL(request['url']).searchParams
  const id = params.get('id')

  if (!id) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))
  const artists = getStore('artists')
  const albums = getStore('albums')
  const scrobbles = getStore('scrobbles')

  if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const trackNumber = payload['Metadata']['index']
    const timestamp = DateTime.now()
    const artistsMap = await artists.get('artists-map', { type: 'json' })
    const artistSanitizedKey = `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
    const albumSanitizedKey = `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`
    const trackScrobbleData = {
      track,
      album,
      artist,
      trackNumber,
      timestamp,
      genre: artistsMap[artistSanitizedKey(artist)]?.['genre'] || ''
    }
    const scrobbleData = await scrobbles.get(`${weekKey()}`, { type: 'json'})
    const windowData = await scrobbles.get('window', { type: 'json'})
    const artistUrl = (artistsMap[artistSanitizedKey(artist)]?.['mbid'] && artistsMap[artistSanitizedKey(artist)]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artistsMap[artistSanitizedKey(artist)]?.['mbid']}` : `https://musicbrainz.org/search?query=${artist.replace(
            /\s+/g,
            '+'
          )}&type=artist`

    await scrobbles.setJSON('now-playing', {...trackScrobbleData, ...{ url: artistUrl }})

    let scrobbleUpdate = scrobbleData
    let windowUpdate = windowData;

    if (scrobbleUpdate?.['data']) scrobbleUpdate['data'].push(trackScrobbleData)
    if (!scrobbleUpdate?.['data']) scrobbleUpdate = { data: [trackScrobbleData] }
    if (windowData?.['data']) windowUpdate['data'].push(trackScrobbleData)
    if (!windowData?.['data']) windowUpdate = { data: [trackScrobbleData] }
    windowUpdate = { data: filterOldScrobbles(windowUpdate.data) }

    await scrobbles.setJSON(`${weekKey()}`, scrobbleUpdate)
    await scrobbles.setJSON('window', windowUpdate)
  }

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/scrobble',
}