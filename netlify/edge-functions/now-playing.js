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
      artist: 'Hot Mulligan',
      aliases: ['Hot Mulligan & Less Gravity'],
    },
    {
      artist: 'Osees',
      aliases: ['OCS', 'The Ohsees', 'Thee Oh Sees', "Thee Oh See's"],
    },
    {
      artist: 'Sněť',
      aliases: ['Snet', 'Sne-T'],
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

const sanitizeTrack = (track) => {
  let sanitizedTrack = track
  if (
    !track.includes('Deluxe') ||
    !track.includes('Special') ||
    !track.includes('Remastered') ||
    !track.includes('Full Dynamic') ||
    !track.includes('Expanded') ||
    !track.includes('Bonus Track')
  )
    return sanitizedTrack
  if (track.includes(' [')) sanitizedTrack = track.split(' [')[0]
  if (track.includes(' (')) sanitizedTrack = track.split(' (')[0]
  return sanitizedTrack
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
        html: `📺 <a href="https://trakt.tv/shows/${traktRes['show']['ids']['slug']}">${traktRes['show']['title']}</a> • <a href="https://trakt.tv/shows/${traktRes['show']['ids']['slug']}/seasons/${traktRes['episode']['season']}/episodes/${traktRes['episode']['number']}">${traktRes['episode']['title']}</a>`,
      })
    }

    if (traktRes['type'] === 'movie') {
      return Response.json({
        text: `🎥 ${traktRes['movie']['title']}`,
        html: `🎥 <a href="https://trakt.tv/movies/${traktRes['movie']['ids']['slug']}">${traktRes['movie']['title']}</a>`,
      })
    }
  }

  const trackRes = await fetch(
    'https://api.music.apple.com/v1/me/recent/played/tracks?limit=1&extend=artistUrl',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_APPLE_MUSIC_DEVELOPER_TOKEN}`,
        'music-user-token': `${API_APPLE_MUSIC_USER_TOKEN}`,
      },
    }
  )
    .then((data) => data.json())
    .catch()
  const track = trackRes.data?.[0]['attributes']
  const trackUrl = track['url']
    ? track['url']
    : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['artistName'].replace(
        /\s+/g,
        '+'
      )}&tag-lookup.track=${track['name'].replace(/\s+/g, '+')}`
  const artist = aliasArtist(track['artistName'])
  const artistUrl = track['artistUrl']
    ? track['artistUrl']
    : `https://musicbrainz.org/search?query=${track['artistName'].replace(/\s+/g, '+')}&type=artist`

  return Response.json({
    text: `🎧 ${sanitizeTrack(track['name'])} by ${artist}`,
    html: `🎧 <a href="${trackUrl}">${sanitizeTrack(
      track['name']
    )}</a> by <a href="${artistUrl}">${artist}</a>`,
  })
}

export const config = { path: '/api/now-playing' }
