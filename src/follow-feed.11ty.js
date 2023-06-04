module.exports = class {
  data() {
    return {
      permalink: '/follow.xml',
    }
  }

  async render() {
    const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
    const feed = new ActivityFeed()

    feed.addSource('atom', '📝', 'https://coryd.dev/feed.xml')
    // feed.addSource('atom', '🔗', 'https://coryd.dev/links.xml')
    feed.addSource('rss', '🎥', 'https://letterboxd.com/cdme/rss')
    feed.addSource('rss', '📖', 'https://oku.club/rss/collection/NvEmF')

    return feed.toRssFeed({
      title: "Cory Dransfeldt's activity feed",
      language: 'en',
      url: 'https://coryd.dev/follow/',
      subtitle: "Cory Dransfeldt's activity across the web.",
    })
  }
}
