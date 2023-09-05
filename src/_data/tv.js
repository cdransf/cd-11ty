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
  const episodes = []
  data.reverse().forEach((episode) => {
    if (episodes.find((e) => e.name === episode?.['show']?.['title'])) {
      // cache the matched episode reference
      const matchedEpisode = episodes.find((e) => e.name === episode?.['show']?.['title'])

      // remove the matched episode from the array
      episodes.splice(
        episodes.findIndex((e) => e.name === episode['show']['title']),
        1
      )

      // populate the subtext to show the appropriate range if it spans multiple seasons
      // this yields a string in the format of S1E1 - S2E2 or S1E1 - E2
      const subtext =
        matchedEpisode['season'] === episode['episode']['season']
          ? `S${matchedEpisode['startingSeason'] || matchedEpisode['season']}E${
              matchedEpisode['startingEpisode'] || matchedEpisode['episode']
            } - E${episode['episode']['number']}`
          : `S${matchedEpisode['startingSeason'] || matchedEpisode['season']}E${
              matchedEpisode['startingEpisode'] || matchedEpisode['episode']
            } - S${episode['episode']['season']}E${episode['episode']['number']}`

      // push the new episode to the array
      episodes.push({
        name: matchedEpisode['name'],
        title: matchedEpisode['title'],
        url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}`,
        subtext,
        image:
          `https://cdn.coryd.dev/tv/${matchedEpisode['name']
            .replace(':', '')
            .replace(/\s+/g, '-')
            .toLowerCase()}.jpg` || 'https://cdn.coryd.dev/tv/missing-tv.jpg',
        startingEpisode: matchedEpisode['episode'],
        startingSeason: matchedEpisode['season'],
        episode: episode['episode']['number'],
        season: episode['episode']['season'],
        type: 'tv',
      })
    } else {
      // if an episode with the same show name doesn't exist, push it to the array
      episodes.push({
        name: episode['show']['title'],
        title: episode['episode']['title'],
        url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}/seasons/${episode['episode']['season']}/episodes/${episode['episode']['number']}`,
        subtext: `${episode['show']['title']} • S${episode['episode']['season']}E${episode['episode']['number']}`,
        image:
          `https://cdn.coryd.dev/tv/${episode['show']['title']
            .replace(':', '')
            .replace(/\s+/g, '-')
            .toLowerCase()}.jpg` || 'https://cdn.coryd.dev/tv/missing-tv.jpg',
        episode: episode['episode']['number'],
        season: episode['episode']['season'],
        type: 'tv',
      })
    }
  })

  // return a reverse sorted array of episodes to match the watch order
  return episodes.reverse()
}
