const createRssFeed = require('eleventy-rss-helper')

const permalink = '/feed.xml'
const baseUrl = 'https://coryd.dev'

module.exports = createRssFeed({
    permalink,
    feedOptions(data) {
        return {
            title: 'Cory Dransfeldt',
            description: 'Latest posts from coryd.dev',
            feed_url: `${baseUrl}${permalink}`,
            site_url: baseUrl,
        }
    },
    items(collections, data) {
        return collections.posts.slice(-20).reverse()
    },
    itemOptions(item, data) {
        return {
            title: item.data.title,
            description: item.data.post_excerpt,
            url: `${baseUrl}${item.url}`,
            date: item.date,
        }
    },
})
