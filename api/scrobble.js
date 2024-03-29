import { getStore } from '@netlify/blobs'

const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr.replace(/[\u0300-\u036f]/g, '').replace(/\.{3}/g, '');
};

export default async (request, context) => {
  const ACCOUNT_ID_PLEX = Netlify.env.get("ACCOUNT_ID_PLEX");
  const MUSIC_KEY = Netlify.env.get("API_KEY_LASTFM");
  const params = new URL(request['url']).searchParams
  const id = params.get('id')
  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))
  console.log(payload)
  console.log(payload['Metadata'])
  const artists = getStore('artists')


  const debug = getStore('debug')
  await debug.setJSON('debug', JSON.stringify(payload))

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
    const artistKey = sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()
    const artistInfo = await artists.getJSON(artistKey)
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
      const mbid = trackRes['track']['artist']['mbid']
      const mbidMap = () => mbidRes[track["artist"]["#text"].toLowerCase()] || "";

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
      genre = genreRes['genres'].sort((a, b) => b.count - a.count)[0]?.["name"] || "";
      const artistData = {
        mbid,
        genre
      }
      await artists.setJSON(artistKey, JSON.stringify(artistData))
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