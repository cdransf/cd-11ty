const tagAliases = require('../data/tag-aliases.json')

const tagList = (collection) => {
  const tagsSet = new Set()
  collection.getAll().forEach((item) => {
    if (!item.data.tags) return
    item.data.tags
      .filter((tag) => !['posts', 'all'].includes(tag))
      .forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

const tagMap = (collection) => {
  const tags = {}
  collection.getAll().forEach((item) => {
    if (item.data.collections.posts) {
      item.data.collections.posts.forEach((post) => {
        const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
        const tagString = [...new Set(post.data.tags.map((tag) => tagAliases[tag.toLowerCase()]))]
          .join(' ')
          .trim()
        if (tagString) tags[url] = tagString
      })
    }
    if (item.data.links) {
      item.data.links.forEach((link) => {
        const tagString = link['tags']
          .map((tag) => tagAliases[tag.toLowerCase()])
          .join(' ')
          .trim()
        if (tagString) tags[link.url] = tagString
      })
    }
  })
  return tags
}

module.exports = {
  tagList,
  tagMap,
}
