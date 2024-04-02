export default async (context, request) => {
  console.log(context)
  console.log(request)

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/debug',
}