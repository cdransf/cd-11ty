import crypto from 'node:crypto'
import { getStore } from '@netlify/blobs'

export default async (request, context) => {
  const params = new URL(request['url']).searchParams
  const ns = params.get('ns')
  const page = params.get('page')
  const ig = params.get('ig')

  const setUrl = (id, event) => `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${id}&name=${encodeURIComponent(event)}`

  const lang = decodeURIComponent(params.get('lang'))
  const nav = decodeURIComponent(params.get('nav'))
  const notLang = !lang || lang === 'null' || lang === 'undefined'
  const notNav = !nav || nav === 'null' || nav === 'undefined'
  const acceptLanguage = notLang ? request['headers'].get('accept-language') : lang
  const userAgent = notNav ? request['headers'].get('user-agent') : nav
  const headers = {
    'Accept-Language': acceptLanguage,
    'User-Agent': userAgent
  }

  let url

  const id = crypto.createHash('md5').update(`${context['ip']}${context['geo']['city']}`).digest('hex')
  const ids = getStore('ids')
  const userId = await ids.get(id)
  if (!userId) await ids.set(id, id)
  const idVal = await ids.get(id)

  if (ig) return
  if (ns) {
    url = setUrl(idVal, 'noscript visit')
  } else {
    url = setUrl(idVal, 'Blocked visit')
  }

  fetch(url, { headers })
  .then((data) => {
    console.log(data);
    return {}
  })
  .catch((err) => {
    console.log(err)
    return {}
  })

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: "/api/event",
}