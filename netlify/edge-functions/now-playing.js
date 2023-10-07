export default async () => {
  // eslint-disable-next-line no-undef
  const API_APPLE_MUSIC_DEVELOPER_TOKEN = Netlify.env.get('API_APPLE_MUSIC_DEVELOPER_TOKEN')
  // eslint-disable-next-line no-undef
  const API_APPLE_MUSIC_USER_TOKEN = Netlify.env.get('API_APPLE_MUSIC_USER_TOKEN')
  const trackRes = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks?limit=1', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
      'music-user-token': `${API_APPLE_MUSIC_USER_TOKEN}`,
    },
  })
    .then((data) => data.json())
    .catch()
  const track = trackRes.data[0]['attributes']

  return Response.json({
    artist: track['artistName'],
    title: track['name'],
    emoji: '🎧',
  })
}

export const config = { path: '/api/now-playing' }
