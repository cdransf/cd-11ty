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
  console.log(nextSunday.toMillis());
  return nextSunday.toMillis()
}

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
    const artistUrl = `https://musicbrainz.org/artist/${artistInfo['mbid']}`
    const trackScrobbleData = {
      track,
      album,
      artist,
      trackNumber,
      timestamp,
      artistUrl
    }
    const scrobbleData = await scrobbles.get(weekStop(), { type: 'json'})
    let scrobbles = scrobbleData;
    scrobbleData.setJSON('now-playing', JSON.stringify(trackScrobbleData))
    const trackKey = `${sanitizeMediaString(track).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
    const artistInit = {
      name: artist,
      artistUrl,
      count: 1
    }
    const albumInit = {
      name: album,
      count: 1
    }
    const trackInit = {
        key: trackKey,
        data: {
          timestamp,
          total: 1,
          artist,
          title,
          artistUrl,
          art: `https://cdn.coryd.dev/albums/${encodeURIComponent(sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase())}-${encodeURIComponent(sanitizeMediaString(album.replace(/[:\/\\,'']+/g, '').replace(/\s+/g, '-').toLowerCase()))}.jpg`
        }
      }

    // 1st scrobble! Let's set up
    if (!scrobbles) {
      scrobbles = {
        chart: {
          total: 1,
          artists: [artistInit],
          albums: [albumInit],
          tracks: [trackInit]
        }
      }
    } else {
      // increment total
      scrobbles['chart']['total']++

      // update artist plays
      if (scrobbles['chart']['artists'].find(a => a.name === artist)) {
        scrobbles['chart']['artists'][scrobbles['chart']['artists'].findIndex(a => a.name === artist)]['count']++
      } else {
        scrobbles['chart']['artists'].push(artistInit)
      }

      // update album plays
      if (scrobbles['chart']['albums'].find(a => a.name === album)) {
        scrobbles['chart']['albums'][scrobbles['chart']['albums'].findIndex(a => a.name === album)]['count']++
      } else {
        scrobbles['chart']['albums'].push(albumInit)
      }

      // update track plays
      if (scrobbles['chart']['tracks'].find(t => t.key === trackKey)) {
        const track = scrobbles['chart']['tracks'][scrobbles['chart']['tracks'].findIndex(t => t.key === key)]
        track[total]++
        track[timestamp] = timestamp
      } else {
        scrobbles['chart']['tracks'].push(trackInit)
      }

      scrobbleData.setJSON(weekStop(), JSON.stringify(scrobbles))
    }
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