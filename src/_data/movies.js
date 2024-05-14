import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function () {
  const { data: movies, error } = await supabase
    .from('movies')
    .select(`
      tmdb_id,
      slug,
      last_watched,
      title,
      year,
      collected,
      plays,
      favorite
    `)
    .order('last_watched', { ascending: false })

  if (error) return []


  const formatMovieData = (movies) => movies.map((item) => {
    const movie = {
      title: item['title'],
      dateAdded: item['last_watched'],
      url: `https://www.themoviedb.org/movie/${item['tmdb_id']}`,
      description: `<p>${item['title']} (${item['year']})</p><p>Watched at: ${DateTime.fromISO(item['last_watched'], { zone: 'utc' }).setZone('America/Los_Angeles').toFormat('MMMM d, yyyy, h:mma')}</p>`,
      type: 'movie',
      image: `https://coryd.dev/media/movies/poster-${item['tmdb_id']}.jpg`,
      plays: item['plays'],
      collected: item['collected'],
      favorite: item['favorite'],
    }
    return movie;
  })

  return {
    movies,
    watchHistory: formatMovieData(movies),
    recentlyWatched: formatMovieData(movies.slice(0, 6)),
  }
}