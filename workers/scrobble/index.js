import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import slugify from 'slugify'

const sanitizeMediaString = (str) => {
  const sanitizedString = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u2010\-\.\?\(\)\[\]\{\}]/g, '')
    .replace(/\.{3}/g, '')
  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  })
}

const sendEmail = async (subject, text, authHeader, maxRetries = 3) => {
  const emailData = new URLSearchParams({
    from: '<coryd.dev> hi@admin.coryd.dev',
    to: 'hi@coryd.dev',
    subject: subject,
    text: text,
  }).toString()

  let attempt = 0
  let success = false

  while (attempt < maxRetries && !success) {
    attempt++
    try {
      const response = await fetch('https://api.forwardemail.net/v1/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader,
        },
        body: emailData,
      })

      if (!response.ok) {
        const responseText = await response.text()
        console.error(`Attempt ${attempt}: Email API response error:`, response.status, responseText)
        throw new Error(`Failed to send email: ${responseText}`)
      }

      console.log('Email sent successfully on attempt', attempt)
      success = true
    } catch (error) {
      console.error(`Attempt ${attempt}: Error sending email:`, error.message)

      if (attempt < maxRetries) {
        console.log(`Retrying email send (attempt ${attempt + 1}/${maxRetries})...`)
      } else {
        console.error('All attempts to send email failed.')
      }
    }
  }

  return success
}

export default {
  async fetch(request, env) {
    const SUPABASE_URL = env.SUPABASE_URL
    const SUPABASE_KEY = env.SUPABASE_KEY
    const FORWARDEMAIL_API_KEY = env.FORWARDEMAIL_API_KEY
    const ACCOUNT_ID_PLEX = env.ACCOUNT_ID_PLEX
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const authHeader = 'Basic ' + btoa(`${FORWARDEMAIL_API_KEY}:`)
    const url = new URL(request.url)
    const params = url.searchParams
    const id = params.get('id')

    if (!id) return new Response(JSON.stringify({ status: 'Bad request' }), {
      headers: { 'Content-Type': 'application/json' },
    })

    if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({ status: 'Forbidden' }), {
      headers: { 'Content-Type': 'application/json' },
    })

    const contentType = request.headers.get('Content-Type') || ''
    if (!contentType.includes('multipart/form-data')) return new Response(
      JSON.stringify({
        status: 'Bad request',
        message: 'Invalid Content-Type. Expected multipart/form-data.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

    try {
      const data = await request.formData()
      const payload = JSON.parse(data.get('payload'))

      if (payload?.event === 'media.scrobble') {
        const artistName = payload['Metadata']['grandparentTitle']
        const albumName = payload['Metadata']['parentTitle']
        const trackName = payload['Metadata']['title']
        const listenedAt = Math.floor(DateTime.now().toSeconds())
        const artistKey = sanitizeMediaString(artistName)
        const albumKey = `${artistKey}-${sanitizeMediaString(albumName)}`

        let { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .ilike('name_string', artistName)
          .single()

        if (artistError && artistError.code === 'PGRST116') {
          const { error: insertArtistError } = await supabase
            .from('artists')
            .insert([
              {
                mbid: null,
                art: '4cef75db-831f-4f5d-9333-79eaa5bb55ee',
                name: artistName,
                tentative: true,
                total_plays: 0,
              },
            ])

          if (insertArtistError) {
            console.error('Error inserting artist: ', insertArtistError.message)
            return new Response(
              JSON.stringify({
                status: 'error',
                message: insertArtistError.message,
              }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          }

          await sendEmail(
            'New tentative artist record',
            `A new tentative artist record was inserted:\n\nArtist: ${artistName}\nKey: ${artistKey}`,
            authHeader
          )

          ;({ data: artistData, error: artistError } = await supabase
            .from('artists')
            .select('*')
            .ilike('name_string', artistName)
            .single())
        }

        if (artistError) {
          console.error('Error fetching artist:', artistError.message)
          return new Response(
            JSON.stringify({ status: 'error', message: artistError.message }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        }

        let { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .ilike('key', albumKey)
          .single()

        if (albumError && albumError.code === 'PGRST116') {
          const { error: insertAlbumError } = await supabase
            .from('albums')
            .insert([
              {
                mbid: null,
                art: '4cef75db-831f-4f5d-9333-79eaa5bb55ee',
                key: albumKey,
                name: albumName,
                tentative: true,
                total_plays: 0,
                artist: artistData.id,
              },
            ])

          if (insertAlbumError) {
            console.error('Error inserting album:', insertAlbumError.message)
            return new Response(
              JSON.stringify({
                status: 'error',
                message: insertAlbumError.message,
              }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          }

          await sendEmail(
            'New tentative album record',
            `A new tentative album record was inserted:\n\nAlbum: ${albumName}\nKey: ${albumKey}\nArtist: ${artistName}`,
            authHeader
          )

          ;({ data: albumData, error: albumError } = await supabase
            .from('albums')
            .select('*')
            .ilike('key', albumKey)
            .single())
        }

        if (albumError) {
          console.error('Error fetching album:', albumError.message)
          return new Response(
            JSON.stringify({ status: 'error', message: albumError.message }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        }

        const { error: listenError } = await supabase.from('listens').insert([
          {
            artist_name: artistData['name_string'] || artistName,
            album_name: albumData['name'] || albumName,
            track_name: trackName,
            listened_at: listenedAt,
            album_key: albumKey,
          },
        ])

        if (listenError) {
          console.error('Error inserting listen:', listenError.message)
          return new Response(
            JSON.stringify({ status: 'error', message: listenError.message }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        }

        console.log('Listen record inserted successfully')
      }

      return new Response(JSON.stringify({ status: 'success' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      console.error('Error processing request:', e.message)
      return new Response(
        JSON.stringify({ status: 'error', message: e.message }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}