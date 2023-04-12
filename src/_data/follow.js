module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  feed.addSource('atom', 'Blog', 'https://coryd.dev/feed.xml')
  feed.addSource('rss', 'Letterboxd', 'https://letterboxd.com/cdme/rss')
  feed.addSource('rss', 'Oku', 'https://oku.club/rss/collection/NvEmF')
  const entries = feed.getEntries()
  const res = await entries
  const activity = { posts: [] }
  res.forEach((entry) =>
    activity.posts.push({
      id: entry.url,
      title: entry.title,
      url: entry.url,
      content_html: entry.content || '',
      date_published: entry.published,
    })
  )
  return activity
}
