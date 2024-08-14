addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/feeds/')) {
    const response = await fetch(request)
    const rssFeed = await response.text()
    const UMAMI_API_KEY = env.UMAMI_API_KEY
    const feedName = url.pathname.split('/feeds/')[1] || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'
    const analyticsPayload = {
      type: 'event',
      payload: {
        website: UMAMI_API_KEY,
        hostname: url.hostname,
        url: url.pathname,
        referrer: request.headers.get('Referer') || '',
        language: request.headers.get('Accept-Language') || '',
        title: 'RSS Feed Access',
        name: 'rss_feed_view',
        data: {
          feed: feedName,
          userAgent: userAgent
        }
      }
    }

    await fetch('https://dashboard.coryd.dev/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UMAMI_API_KEY}`
      },
      body: JSON.stringify(analyticsPayload)
    })

    return new Response(rssFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml'
      }
    })
  }

  if (url.pathname === '/js/script.js') {
    const targetUrl = 'https://dashboard.coryd.dev/script.js'
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers
    })
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Cache-Control', 'max-age=15552000')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  }

  if (url.pathname === '/js/api/send') {
    const targetUrl = 'https://dashboard.coryd.dev/api/send'
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  }

  return fetch(request)
}