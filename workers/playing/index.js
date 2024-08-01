import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'

const sanitizeMediaString = (str) => {
  const sanitizedString = str.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')

  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  })
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const getCountryName = (countryCode) => regionNames.of(countryCode.trim()) || countryCode.trim()
const parseCountryField = (countryField) => {
  if (!countryField) return null

  const delimiters = /[,\/&and]+/
  const countries = countryField.split(delimiters)

  return countries.map(getCountryName).join(', ')
}

export default {
  async fetch(request, env) {
    const SUPABASE_URL = env.SUPABASE_URL
    const SUPABASE_KEY = env.SUPABASE_KEY
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data, error } = await supabase
      .from('optimized_latest_listen')
      .select('*')
      .single()

    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=360, stale-while-revalidate=1080",
    }

    if (error) {
      console.error('Error fetching data:', error)
      return new Response(JSON.stringify({ error: "Failed to fetch the latest track" }), { headers })
    }

    if (!data) return new Response(JSON.stringify({ message: "No recent tracks found" }), { headers })

    const genreEmoji = data.genre_emoji
    const emoji = data.artist_emoji || genreEmoji

    return new Response(JSON.stringify({
      content: `${emoji || '🎧'} ${data.track_name} by <a href="https://coryd.dev/music/artists/${sanitizeMediaString(data.artist_name)}-${sanitizeMediaString(parseCountryField(data.artist_country))}">${data.artist_name}</a>`,
    }), { headers })
  }
}