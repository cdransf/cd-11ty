const scriptName = '/js/script.js'
const endpoint = '/api/event'

addEventListener("fetch", (event) => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const url = new URL(event.request.url)
  const pathname = url.pathname

  if (pathname === scriptName) {
    return getScript(event)
  } else if (pathname === endpoint) {
    return postData(event)
  }
  return new Response(null, { status: 404 })
}

async function getScript(event) {
  const cache = caches.default
  let response = await cache.match(event.request)

  if (!response) {
    const scriptUrl =
      'https://plausible.io/js/plausible.outbound-links.tagged-events.js'
    response = await fetch(scriptUrl)
    if (response.ok) event.waitUntil(cache.put(event.request, response.clone()))
  }

  return response
}

async function postData(event) {
  const request = new Request(event.request)
  request.headers.delete('cookie')
  return await fetch('https://plausible.io/api/event', request)
}