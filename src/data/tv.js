import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 500

const fetchAllShows = async () => {
  let shows = []
  let rangeStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('optimized_shows')
      .select(`
        id,
        tmdb_id,
        last_watched_at,
        title,
        year,
        collected,
        favorite,
        description,
        review,
        art,
        backdrop,
        episodes
      `)
      .range(rangeStart, rangeStart + PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching shows:', error)
      break
    }

    shows = shows.concat(data)
    if (data.length < PAGE_SIZE) break
    rangeStart += PAGE_SIZE
  }

  return shows
}

const prepareShowData = (show) => ({
  ...show,
  image: show['art'] ? `/${show['art']}` : '',
  backdrop: show['backdrop'] ? `/${show['backdrop']}` : '',
  url: `/watching/shows/${show['tmdb_id']}`,
  episodes: show['episodes'] || []
})

const prepareEpisodeData = (show) => show['episodes'].map(episode => ({
  ...episode,
  show_title: show['title'],
  show_tmdb_id: show['tmdb_id'],
  collected: show['collected'],
  favorite: show['favorite'],
  image: show['image'],
  backdrop: show['backdrop'],
  episode_number: episode['episode_number'] || 0,
  season_number: episode['season_number'] || 0,
  last_watched_at: episode['last_watched_at'] || '1970-01-01T00:00:00Z'
}))

const formatEpisodeData = (episodes) => {
  const showEpisodesMap = {}

  episodes.forEach(episode => {
    const showTmdbId = episode.show_tmdb_id

    if (!showEpisodesMap[showTmdbId]) {
      showEpisodesMap[showTmdbId] = {
        title: episode['show_title'],
        tmdbId: showTmdbId,
        collected: episode['collected'],
        favorite: episode['favorite'],
        dateAdded: episode['last_watched_at'],
        lastWatchedAt: episode['last_watched_at'],
        episodes: [],
        image: episode['image'],
        backdrop: episode['backdrop'],
      }
    }

    showEpisodesMap[showTmdbId].episodes.push({
      name: episode['show_title'],
      url: `/watching/shows/${showTmdbId}`,
      subtext: `S${episode['season_number']}E${episode['episode_number']}`,
      episode: episode['episode_number'],
      season: episode['season_number'],
      tmdbId: showTmdbId,
      type: 'tv',
      dateAdded: episode['last_watched_at'],
      lastWatchedAt: episode['last_watched_at'],
      image: episode['image'],
      backdrop: episode['backdrop'],
    })
  })

  return Object.values(showEpisodesMap).sort((a, b) => new Date(b['episodes'][0]['lastWatchedAt']) - new Date(a['episodes'][0]['lastWatchedAt'])).flatMap(show => {
    const startingEpisode = show['episodes'][show['episodes'].length - 1]['episode']
    const startingSeason = show['episodes'][show['episodes'].length - 1]['season']
    const endingEpisode = show['episodes'][0]['episode']
    const endingSeason = show['episodes'][0]['season']

    if (show.episodes.length > 1) {
      return {
        name: show['title'],
        url: `/watching/shows/${show['tmdbId']}`,
        subtext: `S${startingSeason}E${startingEpisode} - S${endingSeason}E${endingEpisode}`,
        startingEpisode,
        startingSeason,
        episode: endingEpisode,
        season: endingSeason,
        tmdbId: show['tmdbId'],
        collected: show['collected'],
        favorite: show['favorite'],
        type: 'tv-range',
        image: show['image'],
        backdrop: show['backdrop'],
      }
    } else {
      return show['episodes'][0]
    }
  })
}

export default async function () {
  try {
    const rawShows = await fetchAllShows()
    const shows = rawShows.map(prepareShowData)
    const episodes = shows.flatMap(prepareEpisodeData).sort((a, b) => new Date(b['last_watched_at']) - new Date(a['last_watched_at']))

    const favoriteShows = shows.filter(show => show.favorite)

    return {
      shows,
      watchHistory: formatEpisodeData(episodes),
      recentlyWatched: formatEpisodeData(episodes.slice(0, 225)),
      favorites: formatEpisodeData(favoriteShows.flatMap(prepareEpisodeData)).sort((a, b) => a['name'].localeCompare(b['name'])),
    }
  } catch (error) {
    console.error('Error fetching and processing shows data:', error)
    return {
      shows: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: [],
    }
  }
}