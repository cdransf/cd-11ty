import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 1000

const fetchAllShows = async () => {
  let shows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('shows')
      .select(`
        title,
        tmdb_id,
        collected,
        favorite,
        year,
        description,
        review,
        art(filename_disk),
        backdrop(filename_disk),
        episodes (
          episode_number,
          season_number,
          last_watched_at
        )
      `)
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      break
    }

    shows = shows.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return shows
}

const prepareShowData = (show) => {
  return {
    ...show,
    image: show['art']?.['filename_disk'] ? `/${show['art']['filename_disk']}` : '',
    backdrop: show['backdrop']?.['filename_disk'] ? `/${show['backdrop']['filename_disk']}` : ''
  }
}

const prepareEpisodeData = (show) => {
  return show['episodes'].map(episode => ({
    ...episode,
    show_title: show['title'],
    show_tmdb_id: show['tmdb_id'],
    collected: show['collected'],
    favorite: show['favorite'],
    image: show['image'],
    backdrop: show['backdrop']
  }))
}

export default async function () {
  const rawShows = await fetchAllShows()
  const shows = rawShows.map(prepareShowData)

  const episodes = shows.flatMap(prepareEpisodeData)

  episodes.sort((a, b) => new Date(b.last_watched_at) - new Date(a.last_watched_at))

  const formatEpisodeData = (episodes) => {
    const showEpisodesMap = {}

    episodes.forEach(episode => {
      const showTitle = episode['show_title']
      const showTmdbId = episode['show_tmdb_id']
      const episodeNumber = episode['episode_number']
      const seasonNumber = episode['season_number']
      const lastWatchedAt = episode['last_watched_at']
      const collected = episode['collected']
      const favorite = episode['favorite']
      const image = episode['image']
      const backdrop = episode['backdrop']

      if (!showEpisodesMap[showTmdbId]) {
        showEpisodesMap[showTmdbId] = {
          title: showTitle,
          tmdbId: showTmdbId,
          collected,
          favorite,
          dateAdded: lastWatchedAt,
          lastWatchedAt,
          episodes: [],
          image,
          backdrop
        }
      }

      showEpisodesMap[showTmdbId].episodes.push({
        name: showTitle,
        url: `/watching/shows/${showTmdbId}`,
        subtext: `S${seasonNumber}E${episodeNumber}`,
        episode: episodeNumber,
        season: seasonNumber,
        tmdbId: showTmdbId,
        type: 'tv',
        dateAdded: lastWatchedAt,
        lastWatchedAt,
        image,
        backdrop
      })
    })

    const sortedShows = Object.values(showEpisodesMap).sort((a, b) => new Date(b.episodes[0]['lastWatchedAt']) - new Date(a.episodes[0]['lastWatchedAt']))

    const episodeData = []
    sortedShows.forEach(show => {
      const startingEpisode = show['episodes'][show['episodes'].length - 1]['episode']
      const startingSeason = show['episodes'][show['episodes'].length - 1]['season']
      const endingEpisode = show['episodes'][0].episode
      const endingSeason = show['episodes'][0].season

      if (show['episodes'].length > 1) {
        episodeData.push({
          name: show.title,
          url: `/watching/shows/${show.tmdbId}`,
          subtext: `S${startingSeason}E${startingEpisode} - S${endingSeason}E${endingEpisode}`,
          startingEpisode,
          startingSeason,
          episode: endingEpisode,
          season: endingSeason,
          tmdbId: show.tmdbId,
          collected: show.collected,
          favorite: show.favorite,
          type: 'tv-range',
          image: show.image,
          backdrop: show.backdrop
        })
      } else {
        const singleEpisode = show['episodes'][0]
        singleEpisode.collected = show['collected']
        singleEpisode.favorite = show['favorite']
        singleEpisode.image = show['image']
        singleEpisode.backdrop = show['backdrop']
        episodeData.push(singleEpisode)
      }
    })

    return episodeData
  }

  const favoriteShows = shows.filter(show => show['favorite'])

  return {
    shows,
    watchHistory: formatEpisodeData(episodes),
    recentlyWatched: formatEpisodeData(episodes.slice(0, 225)),
    favorites: formatEpisodeData(favoriteShows.flatMap(prepareEpisodeData)).sort((a, b) => a['name'].localeCompare(b['name']))
  }
}