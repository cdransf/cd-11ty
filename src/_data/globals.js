import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchGlobals = async () => {
  const { data, error } = await supabase
    .from('globals')
    .select(`
      *,
      favicon_ico(filename_disk),
      favicon_svg(filename_disk),
      opengraph_default(filename_disk),
      feed_image(filename_disk),
      apple_touch_icon(filename_disk),
      about(filename_disk),
      logo_the_claw(filename_disk)
    `)

  if (error) {
    console.error('Error fetching globals:', error)
    return {}
  }

  const globalData = data.pop()
  const keysToProcess = [
    'favicon_ico',
    'favicon_svg',
    'opengraph_default',
    'feed_image',
    'apple_touch_icon',
    'about',
    'logo_the_claw'
  ]

  keysToProcess.forEach(key => {
    if (globalData[key] && globalData[key].filename_disk) {
      globalData[key] = globalData[key].filename_disk
    }
  })

  return globalData
}

export default async function () {
  return await fetchGlobals()
}