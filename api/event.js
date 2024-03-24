import crypto from 'node:crypto'
import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const ns = new URL(request['url']).searchParams.get('ns')
  const page = new URL(request['url']).searchParams.get('page')
  const num = new URL(request['url']).searchParams.get('num')
  const lang = decodeURIComponent(new URL(request['url']).searchParams.get('lang'))
  const nav = decodeURIComponent(new URL(request['url']).searchParams.get('nav'))
  const ig = new URL(request['url']).searchParams.get('ig')
  const setUrl = (id, event) => `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${id}&name=${encodeURIComponent(event)}`
  const headers = {}
  if (lang) headers['Accept-Language'] = lang;
  if (nav) headers['User-Agent'] = nav;
  let url;

  if (ig) return;
  if (ns) {
    const id = crypto.createHash('md5').update(`${context['ip']}${context['geo']['city']}`).digest('hex');
    const ids = getStore('ids')
    const userId = await ids.get(id)
    if (!userId) await ids.set(id, id)
    const idVal = await ids.get(id)
    url = setUrl(idVal, `[noscript visit] ID: ${idVal}`)
  } else {
    url = setUrl(num, `[Blocked visit] ID: ${num || 'unknown'}`)
  }

  fetch(url, { headers })
    .then((data) => {
      console.log(data)
      return {}
    })
    .catch(err => {
      console.log(err);
      return {}
    });

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: "/api/event",
};