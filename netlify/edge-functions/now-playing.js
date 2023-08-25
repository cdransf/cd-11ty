const emojiMap = (genre, artist) => {
  if (artist === 'David Bowie') return '👨‍🎤'
  if (genre.includes('metal')) return '🤘'
  if (genre.includes('emo')) return '😢'
  if (genre.includes('alternative')) return '🎸'
  if (genre.includes('grind') || genre.includes('powerviolence')) return '🫨'
  if (genre.includes('country') || genre.includes('americana') || genre.includes('bluegrass'))
    return '🪕'
  if (genre.includes('post-punk')) return '😔'
  if (genre.includes('punk') || genre.includes('hardcore')) return '✊'
  if (genre.includes('hip hop')) return '🎤'
  if (genre.includes('dance') || genre.includes('electronic')) return '💻'
  return '🎧'
}

export default async () => {
  // eslint-disable-next-line no-undef
  const MUSIC_KEY = Netlify.env.get('API_KEY_LASTFM')
  const trackUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=cdrn_&api_key=${MUSIC_KEY}&limit=1&format=json`
  const trackRes = await fetch(trackUrl, {
    type: 'json',
  }).catch()
  const trackData = await trackRes.json()
  const track = trackData['recenttracks']['track'][0]
  const genreUrl = `https://musicbrainz.org/ws/2/artist/${track['artist']['mbid']}?inc=aliases+genres&fmt=json`
  const genreRes = await fetch(genreUrl, {
    type: 'json',
  }).catch()
  const genreData = await genreRes.json()
  const genre = genreData.genres.sort((a, b) => b.count - a.count)[0]['name']

  return Response.json({
    artist: track['artist']['#text'],
    title: track['name'],
    genre,
    emoji: emojiMap(genre, track['artist']['#text']),
  })
}

export const config = { path: '/api/now-playing' }
