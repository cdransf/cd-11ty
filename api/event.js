import crypto from 'node:crypto'
import { getStore, listStores } from '@netlify/blobs';

export default async (request, context) => {
  const ns = new URL(request['url']).searchParams.get('ns')
  const page = new URL(request['url']).searchParams.get('page')
  const num = new URL(request['url']).searchParams.get('num')
  const lang = decodeURIComponent(new URL(request['url']).searchParams.get('lang'))
  const nav = decodeURIComponent(new URL(request['url']).searchParams.get('nav'))
  const ig = new URL(request['url']).searchParams.get('ig')
  const ids = getStore('ids')
  const headers = {}
  if (lang) headers['Accept-Language'] = lang;
  if (nav) headers['User-Agent'] = nav;
  let url;

  if (ig) return;
  if (ns) {
    const { stores } = await listStores();
    console.log('### STORES')
    console.log(stores)
    console.log('### STORES')
    const id = crypto.createHash('md5').update(`${context['ip']}${context['geo']['city']}`).digest('hex');
    if (!ids.get(id)) await ids.set(id, id)
    const idVal = await ids.get(id)
    url = `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${idVal}`
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