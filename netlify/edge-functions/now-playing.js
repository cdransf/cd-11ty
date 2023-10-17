const artistAliases = {
  aliases: [
    {
      artist: 'Aesop Rock',
      aliases: ['Aesop Rock & Homeboy Sandman', 'Aesop Rock & Blockhead'],
    },
    {
      artist: 'Fen',
      aliases: ['Sleepwalker & Fen'],
    },
    {
      artist: 'Free Throw',
      aliases: ['Free Throw, Hot Mulligan & Tades Sanville'],
    },
    {
      artist: 'Osees',
      aliases: ['OCS', 'The Ohsees', 'Thee Oh Sees', "Thee Oh See's"],
    },
    {
      artist: 'Tom Waits',
      aliases: ['Tom Waits & Crystal Gayle', 'Crystal Gayle'],
    },
  ],
}

const aliasArtist = (artist) => {
  const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(artist))
  if (aliased) artist = aliased.artist
  return artist
}

export default async () => {
  // eslint-disable-next-line no-undef
  const API_APPLE_MUSIC_DEVELOPER_TOKEN = Netlify.env.get('API_APPLE_MUSIC_DEVELOPER_TOKEN')
  // eslint-disable-next-line no-undef
  const API_APPLE_MUSIC_USER_TOKEN = Netlify.env.get('API_APPLE_MUSIC_USER_TOKEN')
  // eslint-disable-next-line no-undef
  const TV_KEY = Netlify.env.get('API_KEY_TRAKT')

  const traktRes = await fetch('https://api.trakt.tv/users/cdransf/watching', {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': 2,
      'trakt-api-key': TV_KEY,
    },
  })
    .then((data) => {
      if (data.body) return data.json()
      return {}
    })
    .catch()

  if (Object.keys(traktRes).length) {
    if (traktRes['type'] === 'episode') {
      return Response.json({
        text: `📺 ${traktRes['show']['title']} • ${traktRes['episode']['title']}`,
      })
    }

    if (traktRes['type'] === 'movie') {
      return Response.json({
        text: `🎥 ${traktRes['movie']['title']}`,
      })
    }
  }

  const trackRes = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks?limit=1', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
      'music-user-token': `${API_APPLE_MUSIC_USER_TOKEN}`,
    },
  })
    .then((data) => data.json())
    .catch()
  const track = trackRes.data?.[0]['attributes']
  const artist = aliasArtist(track['artistName'])

  return Response.json({
    text: `🎧 ${track['name']} by ${artist}`,
  })
}

export const config = { path: '/api/now-playing' }
