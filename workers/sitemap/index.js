import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_KEY || process.env.SUPABASE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
      const { data, error } = await supabase
        .from('optimized_sitemap')
        .select('url, lastmod, changefreq, priority')

      if (error) {
        console.error('Error fetching sitemap data:', error)
        return new Response('Error fetching sitemap data', { status: 500 })
      }

      const sitemapXml = generateSitemapXml(data)
      return new Response(sitemapXml, {
        headers: {
          'Content-Type': 'application/xml',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (error) {
      console.error('Unexpected error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

function generateSitemapXml(data) {
  const urls = data.map(({ url, lastmod, changefreq, priority }) => `
    <url>
      <loc>${url}</loc>
      ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`
}