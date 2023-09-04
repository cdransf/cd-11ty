module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  
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
