module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  feed.addSource('rss', '📝', 'https://coryd.dev/feeds/posts')
  feed.addSource('rss', '🎥', 'https://letterboxd.com/cdme/rss')
  feed.addSource('rss', '🔗', 'https://coryd.dev/feeds/links')
  feed.addSource('rss', '📖', 'https://coryd.dev/feeds/books')
  const entries = feed.getEntries().catch()
  const res = await entries
  const activity = { posts: [] }
  res.forEach((entry) => {
    let excerpt = ''
    if (entry.content) excerpt = entry.content
    if (entry.data?.post_excerpt) excerpt = entry.data.post_excerpt

    activity.posts.push({
      id: entry.url,
      title: entry.title,
      url: entry.url,
      description: excerpt,
      content_html: excerpt,
      date_published: entry.published,
    })
  })
  return activity
}
