import EleventyFetch from '@11ty/eleventy-fetch'

export default async function () {
  const TV_KEY = process.env.API_KEY_TRAKT
  const MOVIEDB_KEY = process.env.API_KEY_MOVIEDB
  const url = 'https://api.trakt.tv/users/cdransf/history/shows?page=1&limit=75'
  const formatEpisodeData = (shows) => {
    const episodeData = []
    const startingEpisodes = []
    const startingSeasons = []
    shows.reverse().forEach((episode) => {
      const episodeNumber = episode['episode']['number']
      const seasonNumber = episode['episode']['season']
      if (!startingEpisodes.find((e) => e.show === episode['show']['title'])) startingEpisodes.push({ show: episode['show']['title'], episode: episodeNumber })
      if (!startingSeasons.find((e) => e.show === episode['show']['title'])) startingSeasons.push({ show: episode['show']['title'], season: seasonNumber })

      if (episodeData.find((e) => e.name === episode?.['show']?.['title'])) {
        // cache the matched episode reference
        const matchedEpisode = episodeData.find((e) => e.name === episode?.['show']?.['title'])
        const startingEpisode = startingEpisodes.find((e) => e.show === episode['show']['title'])['episode']
        const startingSeason = startingSeasons.find((e) => e.show === episode['show']['title'])['season']

        // remove the matched episode from the array
        episodeData.splice(
          episodeData.findIndex((e) => e.name === episode['show']['title']),
          1
        )

        // push the new episode to the array
        episodeData.push({
          name: matchedEpisode['name'],
          url: `https://trakt.tv/shows/${episode['show']['ids']['slug']}`,
          subtext: `S${startingSeason}E${startingEpisode} - S${episode['episode']['season']}E${episode['episode']['number']}`,
          startingEpisode,
          startingSeason,
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

    return episodeData.reverse()
  }

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
  const shows = await res
  const episodes = formatEpisodeData(shows)
  for (const episode of episodes) {
    const tmdbId = episode['tmdbId']
    const tmdbUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${MOVIEDB_KEY}`
    const tmdbRes = EleventyFetch(tmdbUrl, {
      duration: '1h',
      type: 'json',
    })
    const tmdbData = await tmdbRes
    const posterPath = tmdbData['poster_path']
    episode.image = `https://coryd.dev/.netlify/images/?url=https://image.tmdb.org//t/p/w500${posterPath}&w=200&h=307&fit=fill`
  }

  return episodes;
}
