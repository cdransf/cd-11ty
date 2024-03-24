import crypto from 'node:crypto'
import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const FATHOM_KEY = Netlify.env.get("API_KEY_FATHOM_EVENTING")
  const FATHOM_EVENT_URL = 'https://api.usefathom.com/v1/sites/CWSVCDJC/events/'
  const ns = new URL(request['url']).searchParams.get('ns')
  const page = new URL(request['url']).searchParams.get('page')
  const num = new URL(request['url']).searchParams.get('num')
  const lang = decodeURIComponent(new URL(request['url']).searchParams.get('lang'))
  const nav = decodeURIComponent(new URL(request['url']).searchParams.get('nav'))
  const ig = new URL(request['url']).searchParams.get('ig')
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
    url = `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${idVal}`
    fetch(`${FATHOM_EVENT_URL}no-script-visit-id-${idVal}`, { headers: { "Authorization": `Bearer ${FATHOM_KEY}` }})
  } else {
    url = `https://cdn.usefathom.com/?h=${encodeURIComponent(page)}&sid=CWSVCDJC&cid=${num}`
    fetch(`${FATHOM_EVENT_URL}blocked-visit-id-${num}`, { headers: { "Authorization": `Bearer ${FATHOM_KEY}` }})
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