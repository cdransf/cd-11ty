import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllTags = async () => {
  const { data, error } = await supabase
    .from('posts_tags')
    .select('posts_id, tags(name)')

  if (error) {
    console.error('Error fetching all tags from Supabase:', error)
    return {}
  }

  return data.reduce((acc, { posts_id, tags }) => {
    if (!tags || !tags['name']) return acc
    if (!acc[posts_id]) acc[posts_id] = []
    acc[posts_id].push(tags['name'])
    return acc
  }, {})
}

const fetchAllBlocks = async () => {
  const { data, error } = await supabase
    .from('posts_blocks')
    .select('posts_id, collection, item, sort')

  if (error) {
    console.error('Error fetching all blocks from Supabase:', error)
    return {}
  }

  return data.reduce((acc, block) => {
    if (!acc[block['posts_id']]) {
      acc[block['posts_id']] = []
    }
    acc[block['posts_id']].push(block)
    return acc
  }, {})
}

const fetchBlockData = async (collection, itemId) => {
  const { data, error } = await supabase
    .from(collection)
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) {
    console.error(`Error fetching data from ${collection} for item ${itemId}:`, error)
    return null
  }

  return data
}

const fetchAllPosts = async () => {
  let posts = []
  let page = 0
  let fetchMore = true
  const uniqueSlugs = new Set()

  while (fetchMore) {
    const { data, error } = await supabase
      .from('optimized_posts')
      .select('*')
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return posts
    }

    if (data.length < PAGE_SIZE) fetchMore = false

    for (const post of data) {
      if (uniqueSlugs.has(post['slug'])) continue

      uniqueSlugs.add(post['slug'])
      posts.push(post)
    }

    page++
  }

  return posts
}

const processPosts = async (posts, tagsByPostId, blocksByPostId) => {
  return Promise.all(posts.map(async post => {
    // tags
    post['tags'] = tagsByPostId[post['id']] || []

    // blocks
    const blocks = blocksByPostId[post['id']] || []
    post['blocks'] = await Promise.all(blocks.map(async block => {
      const blockData = await fetchBlockData(block['collection'], block['item'])
      if (!blockData) return null
      return {
        'type': block['collection'],
        'sort': block['sort'],
        ...blockData
      }
    })).then(blocks => blocks.filter(block => block !== null))

    // artists
    post['artists'] = post['artists'] ? post['artists'].sort((a, b) => a['name'].localeCompare(b['name'])) : null

    // books
    post['books'] = post['books'] ? post['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null

    // movies
    post['movies'] = post['movies'] ? post['movies'].map(movie => {
      movie['url'] = `/watching/movies/${movie['tmdb_id']}`
      return movie
    }).sort((a, b) => b['year'] - a['year']) : null

    // genres
    post['genres'] = post['genres'] ? post['genres'].sort((a, b) => a['name'].localeCompare(b['name'])) : null

    // shows
    post['shows'] = post['shows'] ? post['shows'].map(show => {
      show['url'] = `/watching/shows/${show['tmdb_id']}`
      return show
    }).sort((a, b) => b['year'] - a['year']) : null

    // image
    if (post['image']) post['image'] = post['image']['filename_disk']

    return post
  }))
}

export default async function () {
  const [posts, tagsByPostId, blocksByPostId] = await Promise.all([
    fetchAllPosts(),
    fetchAllTags(),
    fetchAllBlocks()
  ])

  return await processPosts(posts, tagsByPostId, blocksByPostId)
}