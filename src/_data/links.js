import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 50

const fetchTagsForLink = async (linkId) => {
  const { data, error } = await supabase
    .from('links_tags')
    .select('tags(id, name)')
    .eq('links_id', linkId)

  if (error) {
    console.error(`Error fetching tags for link ${linkId}:`, error)
    return []
  }

  return data.map((lt) => lt.tags.name)
}

const fetchAllLinks = async () => {
  let links = []
  let page = 0
  let fetchMore = true

  while (fetchMore) {
    const { data, error } = await supabase
      .from('links')
      .select('*, authors (name, url)')
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching links:', error)
      return links
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    for (const link of data) {
      link.tags = await fetchTagsForLink(link.id)
    }

    links = links.concat(data)
    page++
  }

  return links
}

export default async function () {
  return await fetchAllLinks()
}