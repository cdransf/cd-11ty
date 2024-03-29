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
  const artists = getStore('artists')

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
    const artistInfo = await artists.get(artistKey, { type: 'json'}) // get the artist blob

    console.log('artist', artist)
    console.log('track', track)

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
      console.log(trackRes)
      const trackData = trackRes["recenttracks"]["track"][0];
      let mbid = trackRes['track']['artist']['mbid']
      const mbidMap = () => mbidRes[trackData['artist']['#text'].toLowerCase()] || "";

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
        genre,
        image: `https://cdn.coryd.dev/artists/${encodeURIComponent(sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase())}.jpg`
      }
      console.log(artistData)
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