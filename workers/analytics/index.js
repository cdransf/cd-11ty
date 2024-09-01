addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/js/script.js') {
    const targetUrl = 'https://stats.coryd.dev/script.js'
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
    const targetUrl = 'https://stats.coryd.dev/api/send'
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