const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const TV_KEY = process.env.API_KEY_TRAKT
  const MOVIEDB_KEY = process.env.API_KEY_MOVIEDB
  const url = 'https://api.trakt.tv/users/cdransf/history/shows?page=1&limit=36'
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
  const episodeData = []
  data.reverse().forEach((episode) => {
    const episodeNumber = episode['episode']['number']
    const seasonNumber = episode['episode']['season']

    if (episodeData.find((e) => e.name === episode?.['show']?.['title'])) {
      // cache the matched episode reference
      const matchedEpisode = episodeData.find((e) => e.name === episode?.['show']?.['title'])

      // remove the matched episode from the array
      episodeData.splice(
        episodeData.findIndex((e) => e.name === episode['show']['title']),
        1
      )

      // push the new episode to the array
      episodeData.push({
        name: matchedEpisode['name'],
        title: matchedEpisode['title'],
        url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}`,
        subtext: `S${matchedEpisode['startingSeason'] || matchedEpisode['season']}E${
          matchedEpisode['startingEpisode'] || matchedEpisode['episode']
        } - S${episode['episode']['season']}E${episode['episode']['number']}`,
        startingEpisode: matchedEpisode['episode'],
        startingSeason: matchedEpisode['season'],
        episode: episodeNumber,
        season: seasonNumber,
        id: episode['show']['ids']['trakt'],
        tmdbId: episode['show']['ids']['tmdb'],
        type: 'tv-range',
      })
    } else {
      // if an episode with the same show name doesn't exist, push it to the array
      episodeData.push({
        name: episode['show']['title'],
        title: episode['episode']['title'],
        url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}/seasons/${episode['episode']['season']}/episodes/${episode['episode']['number']}`,
        subtext: `${episode['show']['title']} • S${episode['episode']['season']}E${episode['episode']['number']}`,
        episode: episodeNumber,
        season: seasonNumber,
        id: episode['show']['ids']['trakt'],
        tmdbId: episode['show']['ids']['tmdb'],
        type: 'tv',
      })
    }
  })

  const episodes = episodeData.reverse()

  for (const episode of episodes) {
    const tmdbId = episode['tmdbId']
    const tmdbUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${MOVIEDB_KEY}`
    const tmdbRes = EleventyFetch(tmdbUrl, {
      duration: '1h',
      type: 'json',
    })
    const tmdbData = await tmdbRes
    const posterPath = tmdbData['poster_path']
    episode.image = `https://movies.coryd.dev/t/p/w500${posterPath}`
  }

  return episodes
}
