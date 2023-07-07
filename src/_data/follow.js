module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  feed.addSource('atom', '📝', 'https://coryd.dev/feed.xml')
  feed.addSource('atom', '🔗', 'https://coryd.dev/links.xml')
  feed.addSource('rss', '🎥', 'https://letterboxd.com/cdme/rss')
  feed.addSource('rss', '📖', 'https://coryd.dev/books.xml')
  const entries = feed.getEntries().catch()
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
