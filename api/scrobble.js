import { getStore } from '@netlify/blobs'

export default async (request, context) => {
  console.log(request)
  console.log(context)
  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: "/api/scrobble",
}