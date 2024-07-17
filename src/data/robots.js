import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PAGE_SIZE = 100

const fetchAllRobots = async () => {
  let robots = []
  let from = 0
  let to = PAGE_SIZE - 1

  while (true) {
    const { data, error } = await supabase
      .from('robots')
      .select('user_agent')
      .range(from, to)

    if (error) {
      console.error('Error fetching robot data:', error)
      return null
    }

    robots = robots.concat(data)
    if (data.length < PAGE_SIZE) break
  }

  return robots.map(robot => robot['user_agent']).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

export default async function () {
  return await fetchAllRobots()
}
