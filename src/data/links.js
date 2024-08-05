import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllTags = async () => {
  const { data, error } = await supabase
    .from('links_tags')
    .select('links_id, tags(name)')

  if (error) {
    console.error('Error fetching all tags from Supabase:', error)
    return {}
  }

  return data.reduce((acc, { links_id, tags }) => {
    if (!tags || !tags.name) return acc
    if (!acc[links_id]) acc[links_id] = []
    acc[links_id].push(tags['name'])
    return acc
  }, {})
}

const fetchAllLinks = async () => {
  let links = []
  let page = 0
  let fetchMore = true

  while (fetchMore) {
    const { data, error } = await supabase
      .from('links')
      .select('*, authors (name, url, mastodon)')
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching links:', error)
      return links
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    links = links.concat(data)
    page++
  }

  return links
}

const processLinks = (links, tagsByLinkId) => {
  return links.map(link => {
    link['tags'] = tagsByLinkId[link['id']] || []
    link['type'] = 'link'
    return link
  })
}

export default async function () {
  const [links, tagsByLinkId] = await Promise.all([fetchAllLinks(), fetchAllTags()])
  return processLinks(links, tagsByLinkId)
}