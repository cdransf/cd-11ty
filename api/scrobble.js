import { getStore } from '@netlify/blobs'
import { DateTime } from 'luxon'

const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr.replace(/[\u0300-\u036f]/g, '').replace(/\.{3}/g, '');
};

const weekStop = () => {
  const currentDate = DateTime.now()
  let nextSunday = currentDate.plus({ days: (7 - currentDate.weekday) % 7 })
  nextSunday = nextSunday.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  return nextSunday.toMillis()
}

const twoWeeksAgo = DateTime.now().minus({ weeks: 2 });
const filterOldScrobbles = (scrobbles) => scrobbles.filter(scrobble => {
  let timestamp = DateTime.fromISO(scrobble.timestamp)
  return timestamp.diff(twoWeeksAgo).as('weeks') <= -2
});

export default async (request) => {
  const ACCOUNT_ID_PLEX = Netlify.env.get("ACCOUNT_ID_PLEX");
  const MUSIC_KEY = Netlify.env.get("API_KEY_LASTFM");
  const params = new URL(request['url']).searchParams
  const id = params.get('id')
  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))
  const artists = getStore('artists')
  const scrobbles = getStore('scrobbles')

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

  if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const trackNumber = payload['Metadata']['index']
    const timestamp = DateTime.now()
    const artistKey = sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()
    let artistInfo = await artists.get(artistKey, { type: 'json'}) // get the artist blob

    // if there is no artist blob, populate one
    if (!artistInfo) {
      const trackRes = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${MUSIC_KEY}&artist=${artist}&track=${track}&format=json`,
        {
          type: "json",
        }
      ).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the Last.fm endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const mbidRes = await fetch("https://coryd.dev/api/mbids", {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the mbid endpoint.');
      }).catch(err => {
          console.log(err);
          return {}
        });
      const trackData = trackRes['track'];
      let mbid = trackRes['track']['artist']['mbid']
      const mbidMap = () => mbidRes[trackData['artist']['name'].toLowerCase()] || '';

      // mbid mismatches
      if (mbidMap() !== "") mbid = mbidMap();

      const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`;
      const genreRes = await fetch(genreUrl, {
        type: "json",
      }).then((data) => {
        if (data.ok) return data.json()
        throw new Error('Something went wrong with the MusicBrainz endpoint.');
      }).catch(err => {
        console.log(err);
        return {}
      });
      const genre = genreRes['genres'].sort((a, b) => b.count - a.count)[0]?.['name'] || '';
      const artistData = {
        mbid,
        genre,
        image: `https://cdn.coryd.dev/artists/${encodeURIComponent(sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase())}.jpg`
      }
      await artists.setJSON(artistKey, JSON.stringify(artistData))
    }

    // scrobble logic
    artistInfo = await artists.get(artistKey, { type: 'json'})
    console.log(artistInfo?.['mbid'])
    const artistUrl = `https://musicbrainz.org/artist/${artistInfo?.['mbid']}`
    const trackScrobbleData = {
      track,
      album,
      artist,
      trackNumber,
      timestamp,
      artistUrl
    }
    const scrobbleData = await scrobbles.get(`${weekStop()}`, { type: 'json'})
    const windowData = await scrobbles.get('window', { type: 'json'})
    await scrobbles.setJSON('now-playing', JSON.stringify(trackScrobbleData))
    let scrobbleUpdate = scrobbleData
    let windowUpdate = windowData;
    console.log('### SCROBBLE')
    console.log(scrobbleUpdate)
    console.log('### SCROBBLE')
    console.log('### WINDOW')
    console.log(windowUpdate)
    console.log('### WINDOW')
    if (scrobbleUpdate['data']) scrobbleUpdate['data'].push(trackScrobbleData)
    if (!scrobbleUpdate['data']) scrobbleUpdate = { data: [trackScrobbleData] }
    if (windowData['data']) windowUpdate['data'].push(trackScrobbleData)
    if (!windowData['data']) windowUpdate = { data: [trackScrobbleData] }
    await scrobbles.setJSON(`${weekStop()}`, JSON.stringify(scrobbleUpdate))
    await scrobbles.setJSON('window', JSON.stringify(filterOldScrobbles(windowUpdate.data)))
  }

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: "/api/scrobble",
}