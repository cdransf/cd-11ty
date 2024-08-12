addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/js/script.js') {
    const targetUrl = 'https://dashboard.coryd.dev/script.js'
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers
    })
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Cache-Control', 'max-age=2592000')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  }
  return fetch(request)
}