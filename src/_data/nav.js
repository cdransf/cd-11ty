import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const fetchAllNavigation = async () => {
  const { data, error } = await supabase
    .from('navigation')
    .select(`
      *,
      pages(title, permalink)
    `)

  if (error) {
    console.error('Error fetching navigation data:', error)
    return null
  }

  const menu = {}
  data.forEach(item => {
    const menuItem = item.pages ? {
      title: item.pages.title,
      permalink: item.pages.permalink,
      icon: item.icon,
      sort: item.sort
    } : {
      title: item.title,
      permalink: item.permalink,
      icon: item.icon,
      sort: item.sort
    }

    if (!menu[item.menu_location]) {
      menu[item.menu_location] = [menuItem]
    } else {
      menu[item.menu_location].push(menuItem)
    }
  })

  Object.keys(menu).forEach(location => {
    menu[location].sort((a, b) => a.sort - b.sort)
  })

  return menu
}

export default async function () {
  return await fetchAllNavigation()
}