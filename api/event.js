import crypto from 'node:crypto'
import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const ns = new URL(request['url']).searchParams.get('ns')
  const id = crypto.createHash('md5').update(`${context['ip']}${context['geo']['city']}`).digest('hex');
  const page = new URL(request['url']).searchParams.get('page')
  const num = new URL(request['url']).searchParams.get('num')
  const lang = decodeURIComponent(new URL(request['url']).searchParams.get('lang'))
  const nav = decodeURIComponent(new URL(request['url']).searchParams.get('nav'))
  const i = new URL(request['url']).searchParams.get('i')
  const headers = {}
  if (lang) headers['Accept-Language'] = lang;
  if (nav) headers['User-Agent'] = nav;
  let url;

  if (i) return;

  if (ns) {
    const ids = getStore('ids')
    if (!ids.get(id)) ids.set(id, '')
    const id = ids.get(id)
    url = `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${id}`
  } else {
    url = `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${num}`
  }

  fetch(`https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${num}`,
    { headers })
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