export default async (request, context) => {
  fetch(`https://cdn.usefathom.com/?h=${encodeURIComponent(request['referer'] || 'https://coryd.dev/unknown')}&sid=CWSVCDJC&cid=${context['requestId']}`)
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