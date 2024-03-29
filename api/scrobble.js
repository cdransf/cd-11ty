import { getStore } from '@netlify/blobs'

export default async (request, context) => {
  const ACCOUNT_ID_PLEX = Netlify.env.get("ACCOUNT_ID_PLEX");
  const params = new URL(request['url']).searchParams
  const id = params.get('id')
  const data = await request.formData()
  const payload = data['payload']
  console.log(data)
  console.log(payload)

  if (!id) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (id !== ACCOUNT_ID_PLEX) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (payload?.event === 'media.scrobble') {
    console.log('scrobble')
  }

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: "/api/scrobble",
}