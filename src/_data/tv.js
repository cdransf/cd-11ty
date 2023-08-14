const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const TV_KEY = process.env.API_KEY_TRAKT
  const url = 'https://api.trakt.tv/users/cdransf/history/shows'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': 2,
        'trakt-api-key': TV_KEY,
      },
    },
  }).catch()
  const data = await res
  return data.map((episode) => {
    return {
      name: episode['show']['title'],
      title: episode['episode']['title'],
      url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}/seasons/${episode['episode']['season']}/episodes/${episode['episode']['number']}`,
      episode: `S${episode['episode']['season']}E${episode['episode']['number']}`,
      image:
        `https://cdn.coryd.dev/tv/${episode['show']['title']
          .replace(':', '')
          .replace(/\s+/g, '-')
          .toLowerCase()}.jpg` || 'https://cdn.coryd.dev/tv/missing-tv.jpg',
      type: 'tv',
    }
  })
}
