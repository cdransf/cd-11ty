import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_KEY']
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PAGE_SIZE = 1000

const fetchAllPosts = async () => {
  let posts = []
  let page = 0
  let fetchMore = true
  const uniquePosts = new Set()

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
      if (uniquePosts.has(post['url'])) continue

      uniquePosts.add(post['url'])
      posts.push(post)
    }

    page++
  }

  return posts
}

const processPosts = async (posts) => {
  return Promise.all(posts.map(async post => {
    post['artists'] = post['artists'] ? post['artists'].sort((a, b) => a['name'].localeCompare(b['name'])) : null
    post['books'] = post['books'] ? post['books'].map(book => ({
      title: book['title'],
      author: book['author'],
      description: book['description'],
      url: `/books/${book['isbn']}`,
    })).sort((a, b) => a['title'].localeCompare(b['title'])) : null
    post['movies'] = post['movies'] ? post['movies'].map(movie => {
      movie['url'] = `/watching/movies/${movie['tmdb_id']}`
      return movie
    }).sort((a, b) => b['year'] - a['year']) : null
    post['genres'] = post['genres'] ? post['genres'].sort((a, b) => a['name'].localeCompare(b['name'])) : null
    post['shows'] = post['shows'] ? post['shows'].map(show => {
      show['url'] = `/watching/shows/${show['tmdb_id']}`
      return show
    }).sort((a, b) => b['year'] - a['year']) : null
    if (post['image']) post['image'] = post['image']['filename_disk']

    return post
  }))
}

export default async function () {
  const posts = await fetchAllPosts()
  return await processPosts(posts)
}