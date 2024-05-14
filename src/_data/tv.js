import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function () {
  const { data: shows, error } = await supabase
    .from('shows')
    .select(`
      title,
      tmdb_id,
      collected,
      favorite,
      episodes (
        episode_number,
        season_number,
        last_watched_at
      )
    `)

  if (error) return []

  let episodes = []
  shows.forEach(show => {
    show.episodes.forEach(episode => {
      episodes.push({
        ...episode,
        show_title: show['title'],
        show_tmdb_id: show['tmdb_id'],
        collected: show['collected'],
        favorite: show['favorite']
      })
    })
  })

  episodes.sort((a, b) => new Date(b['last_watched_at']) - new Date(a['last_watched_at']))
  const allEpisodes = episodes
  episodes = episodes.slice(0, 75)

  const formatEpisodeData = (episodes) => {
    const episodeData = []
    const showEpisodesMap = {}

    episodes.forEach((episode) => {
      const showTitle = episode['show_title']
      const showTmdbId = episode['show_tmdb_id']
      const episodeNumber = episode['episode_number']
      const seasonNumber = episode['season_number']
      const lastWatchedAt = episode['last_watched_at']
      const collected = episode['collected']
      const favorite = episode['favorite']

      if (!showEpisodesMap[showTmdbId]) {
        showEpisodesMap[showTmdbId] = {
          title: showTitle,
          tmdbId: showTmdbId,
          collected: collected,
          favorite: favorite,
          episodes: []
        }
      }

      showEpisodesMap[showTmdbId].episodes.push({
        name: showTitle,
        url: `https://www.themoviedb.org/tv/${showTmdbId}/season/${seasonNumber}/episode/${episodeNumber}`,
        subtext: `${showTitle} • S${seasonNumber}E${episodeNumber}`,
        episode: episodeNumber,
        season: seasonNumber,
        tmdbId: showTmdbId,
        type: 'tv',
        image: `https://coryd.dev/media/shows/poster-${showTmdbId}.jpg`,
        backdrop: `https://coryd.dev/media/shows/backdrops/backdrop-${showTmdbId}.jpg`,
        lastWatchedAt: lastWatchedAt
      })
    })

    const sortedShows = Object.values(showEpisodesMap).sort((a, b) => new Date(b['episodes'][0]['lastWatchedAt']) - new Date(a['episodes'][0]['lastWatchedAt']))

    sortedShows.forEach((show) => {
      const startingEpisode = show['episodes'][show['episodes'].length - 1]['episode']
      const startingSeason = show['episodes'][show['episodes'].length - 1]['season']
      const endingEpisode = show['episodes'][0]['episode']
      const endingSeason = show['episodes'][0]['season']

      if (show.episodes.length > 1) {
        episodeData.push({
          name: show.title,
          url: `https://www.themoviedb.org/tv/${show['tmdbId']}`,
          subtext: `S${startingSeason}E${startingEpisode} - S${endingSeason}E${endingEpisode}`,
          startingEpisode,
          startingSeason,
          episode: endingEpisode,
          season: endingSeason,
          tmdbId: show['tmdbId'],
          collected: show['collected'],
          favorite: show['favorite'],
          type: 'tv-range',
          image: `https://coryd.dev/media/shows/poster-${show['tmdbId']}.jpg`,
          backdrop: `https://coryd.dev/media/shows/backdrops/backdrop-${show['tmdbId']}.jpg`,
        })
      } else {
        const singleEpisode = show['episodes'][0]
        singleEpisode.collected = show['collected']
        singleEpisode.favorite = show['favorite']
        episodeData.push(singleEpisode)
      }
    })

    return episodeData
  }

  const favoriteShows = shows.filter(show => show['favorite'])
  const collectedShows = shows.filter(show => show['collected'])

  return {
    shows,
    watchHistory: formatEpisodeData(allEpisodes),
    recentlyWatched: formatEpisodeData(episodes),
    favorites: formatEpisodeData(favoriteShows.flatMap(show => show['episodes'].map(episode => ({
      ...episode,
      show_title: show['title'],
      show_tmdb_id: show['tmdb_id'],
      collected: show['collected'],
      favorite: show['favorite']
    })))),
    collection: formatEpisodeData(collectedShows.flatMap(show => show['episodes'].map(episode => ({
      ...episode,
      show_title: show['title'],
      show_tmdb_id: show['tmdb_id'],
      collected: show['collected'],
      favorite: show['favorite']
    }))))
  }
}
