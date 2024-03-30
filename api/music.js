import { getStore } from '@netlify/blobs'

export default async (request) => {
  const API_KEY_MUSIC = Netlify.env.get('API_KEY_MUSIC');
  const params = new URL(request['url']).searchParams
  const key = params.get('key')
  const weeks = params.get('key').split(',')

  if (!key) return new Response(JSON.stringify({
      status: 'Bad request',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (key !== API_KEY_MUSIC) return new Response(JSON.stringify({
      status: 'Forbidden',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  const scrobbles = getStore('scrobbles')
  const weekKey = () => {
    const currentDate = DateTime.now();
    return `${currentDate.year}-${currentDate.weekNumber}`
  }
  const scrobbleData = []
  if (weeks) {
    weeks.forEach(async (week) => {
      const weekData = await scrobbles.get(week, { type: 'json'})
      scrobbleData.push(weekData['data'])
    })
  } else {
    const weekData = await scrobbles.get(weekKey(), { type: 'json'})
    scrobbleData.push(weekData['data'])
  }

  return new Response(JSON.stringify({ data: scrobbleData }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/music',
}