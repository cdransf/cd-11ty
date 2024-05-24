import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import slugify from 'slugify'

const SUPABASE_URL = Netlify.env.get('SUPABASE_URL')
const SUPABASE_KEY = Netlify.env.get('SUPABASE_KEY')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const sanitizeMediaString = (str) => {
  const sanitizedString = str.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')

  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  })
}

export default async (request) => {
  const ACCOUNT_ID_PLEX = process.env.ACCOUNT_ID_PLEX
  const params = new URL(request.url).searchParams
  const id = params.get('id')

  if (!id) return new Response(JSON.stringify({ status: 'Bad request' }), { headers: { "Content-Type": "application/json" } })
  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({ status: 'Forbidden' }), { headers: { "Content-Type": "application/json" } })

  const data = await request.formData()
  const payload = JSON.parse(data.get('payload'))

  if (payload?.event === 'media.scrobble') {
    const artist = payload['Metadata']['grandparentTitle']
    const album = payload['Metadata']['parentTitle']
    const track = payload['Metadata']['title']
    const listenedAt = Math.floor(DateTime.now().toSeconds())
    const artistKey = sanitizeMediaString(artist)
    const albumKey = `${artistKey}-${sanitizeMediaString(album)}`

    const { error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('name_string', artist)
      .single()

    if (artistError && artistError.code === 'PGRST116') {
      const { error: insertArtistError } = await supabase.from('artists').insert([
        {
          mbid: null,
          image: `https://coryd.dev/media/artists/${artistKey}.jpg`,
          key: artistKey,
          name: artist,
          tentative: true
        }
      ])

      if (insertArtistError) {
        console.error('Error inserting artist into Supabase:', insertArtistError.message)
        return new Response(JSON.stringify({ status: 'error', message: insertArtistError.message }), { headers: { "Content-Type": "application/json" } })
      }
    } else if (artistError) {
      console.error('Error querying artist from Supabase:', artistError.message)
      return new Response(JSON.stringify({ status: 'error', message: artistError.message }), { headers: { "Content-Type": "application/json" } })
    }

    const { error: albumError } = await supabase
      .from('albums')
      .select('*')
      .eq('key', albumKey)
      .single()

    if (albumError && albumError.code === 'PGRST116') {
      const { error: insertAlbumError } = await supabase.from('albums').insert([
        {
          mbid: null,
          image: `https://coryd.dev/media/albums/${albumKey}.jpg`,
          key: albumKey,
          name: album,
          tentative: true
        }
      ])

      if (insertAlbumError) {
        console.error('Error inserting album into Supabase:', insertAlbumError.message)
        return new Response(JSON.stringify({ status: 'error', message: insertAlbumError.message }), { headers: { "Content-Type": "application/json" } })
      }
    } else if (albumError) {
      console.error('Error querying album from Supabase:', albumError.message)
      return new Response(JSON.stringify({ status: 'error', message: albumError.message }), { headers: { "Content-Type": "application/json" } })
    }

    const { error: listenError } = await supabase.from('listens').insert([
      {
        artist_name: artist,
        album_name: album,
        track_name: track,
        listened_at: listenedAt,
        album_key: albumKey
      }
    ])

    if (listenError) {
      console.error('Error inserting data into Supabase:', listenError.message)
      console.log('Track with the error:', {
        artist_name: artist,
        album_name: album,
        track_name: track,
        listened_at: listenedAt,
        album_key: albumKey
      })
      return new Response(JSON.stringify({ status: 'error', message: listenError.message }), { headers: { "Content-Type": "application/json" } })
    }
  }

  return new Response(JSON.stringify({ status: 'success' }), { headers: { "Content-Type": "application/json" } })
}

export const config = {
  path: '/api/scrobble',
}
