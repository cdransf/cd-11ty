export default async (context, request) => {
  console.log(context)
  console.log(request)
  const data = await request.formData()
  console.log(data)
  const payload = JSON.parse(data.get('payload'))
  console.log(payload)

  return new Response(JSON.stringify({
      status: 'success',
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}

export const config = {
  path: '/api/debug',
}