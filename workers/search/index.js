import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    const allowedOrigin = 'https://coryd.dev'
    const origin = request.headers.get('Origin') || ''
    const referer = request.headers.get('Referer') || ''

    if (!origin.startsWith(allowedOrigin) && !referer.startsWith(allowedOrigin)) return new Response('Forbidden', { status: 403 })

    const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_KEY || process.env.SUPABASE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const types = searchParams.get('type')?.split(',') || []
    const page = parseInt(searchParams.get('page')) || 1
    const pageSize = parseInt(searchParams.get('page_size')) || 10
    const offset = (page - 1) * pageSize

    try {
      let supabaseQuery = supabase
        .from('optimized_search_index')
        .select('*', { count: 'exact' })

      if (types.length > 0) supabaseQuery = supabaseQuery.in('type', types)
      if (query) supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)

      const { data, error, count } = await supabaseQuery.range(offset, offset + pageSize - 1)

      if (error) {
        console.error('Query error:', error)
        return new Response('Error fetching data from Supabase', { status: 500 })
      }

      return new Response(
        JSON.stringify({ results: data, total: count, page, pageSize }),
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      )
    } catch (error) {
      console.error('Unexpected error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}