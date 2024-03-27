import crypto from 'node:crypto'
import { getStore } from '@netlify/blobs'

export default async (request, context) => {
  const params = new URL(request['url']).searchParams
  const ns = params.get('ns')
  const site = params.get('site')
  const page = params.get('page')
  const ignore = params.get('ignore')
  const setUrl = (id, event) => {
    let url = `https://cdn.usefathom.com/?h=${encodeURIComponent(site)}&p=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${id}`
    if (event) url = `${url}&name=${encodeURIComponent(event)}`
    return url
  }
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
  const id = crypto.createHash('md5').update(`${context['ip']}${context['geo']['city']}${context['geo']['latitude']}${context['geo']['longitude']}${userAgent}`).digest('hex')
  let url = setUrl(id)
  const ids = getStore('ids')
  let userId = await ids.get(id)

  if (ignore) return new Response(JSON.stringify({
      status: 'accepted',
    }),
    { headers: { "Content-Type": "application/json" } }
  )

  if (!userId) await ids.set(id, id)
  userId = await ids.get(id)

  if (ns) {
    url = setUrl(userId, `noscript visit: ${page}`)
  } else {
    url = setUrl(userId, `Blocked visit: ${page}`)
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