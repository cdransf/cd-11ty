import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 50

const fetchBlockData = async (collection, itemId) => {
  const { data, error } = await supabase
    .from(collection)
    .select(collection === 'hero' ? '*, image(filename_disk)' : '*')
    .eq('id', itemId)
    .single()

  if (error) {
    console.error(`Error fetching data from ${collection} for item ${itemId}:`, error)
    return null
  }

  return data
}

const fetchBlocksForPage = async (pageId) => {
  const { data, error } = await supabase
    .from('pages_blocks')
    .select('collection, item, sort')
    .eq('pages_id', pageId)

  if (error) {
    console.error(`Error fetching blocks for page ${pageId}:`, error)
    return []
  }

  const blocks = await Promise.all(data.map(async block => {
    const blockData = await fetchBlockData(block.collection, block.item)

    return {
      type: block['collection'],
      sort: block['sort'],
      ...blockData
    }
  }))

  return blocks.sort((a, b) => a.sort - b.sort)
}

const fetchAllPages = async () => {
  let pages = []
  let page = 0
  let fetchMore = true

  while (fetchMore) {
    const { data, error } = await supabase
      .from('pages')
      .select(`
        *,
        open_graph_image(filename_disk)
      `)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching pages:', error)
      return pages
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    for (const page of data) {
      page['blocks'] = await fetchBlocksForPage(page['id'])
      if (page['open_graph_image']) page['open_graph_image'] = page['open_graph_image']['filename_disk']
      pages.push(page)
    }

    page++
  }

  return pages
}

export default async function () {
  return await fetchAllPages()
}