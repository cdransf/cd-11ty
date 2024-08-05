import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 250

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

const fetchAllBlocks = async () => {
  const { data, error } = await supabase
    .from('pages_blocks')
    .select('pages_id, collection, item, sort')

  if (error) {
    console.error('Error fetching all blocks from Supabase:', error)
    return {}
  }

  return data.reduce((acc, block) => {
    if (!acc[block['pages_id']]) {
      acc[block['pages_id']] = []
    }
    acc[block['pages_id']].push(block)
    return acc
  }, {})
}

const fetchAllPages = async () => {
  let pages = []
  let page = 0
  let fetchMore = true

  while (fetchMore) {
    const { data, error } = await supabase
      .from('optimized_pages')
      .select('*')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching pages:', error)
      return pages
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    pages = pages.concat(data)
    page++
  }

  return pages
}

const processPages = async (pages, blocksByPageId) => {
  return Promise.all(pages.map(async page => {
    const blocks = blocksByPageId[page['id']] || []

    page['blocks'] = await Promise.all(blocks.map(async block => {
      const blockData = await fetchBlockData(block['collection'], block['item'])

      if (!blockData) return {
        'type': block['collection'],
        'sort': block['sort']
      }

      return {
        'type': block['collection'],
        'sort': block['sort'],
        ...blockData
      }
    })).then(blocks => blocks.filter(block => block !== null))

    page['blocks'].sort((a, b) => a['sort'] - b['sort'])

    if (page['open_graph_image']) page['open_graph_image'] = page['open_graph_image']['filename_disk']

    return page
  }))
}

export default async function () {
  try {
    const [pages, blocksByPageId] = await Promise.all([
      fetchAllPages(),
      fetchAllBlocks()
    ])
    return await processPages(pages, blocksByPageId)
  } catch (error) {
    console.error('Error fetching and processing pages:', error)
    return []
  }
}