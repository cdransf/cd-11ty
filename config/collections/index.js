import tagAliases from '../data/tag-aliases.js'

export const searchIndex = (collection) => {
  const searchIndex = []
  let id = 0
  const collectionData = collection.getAll()[0]
  const posts = collectionData.data.collections.posts
  const links = collectionData.data.links
  if (posts) {
    posts.forEach((post) => {
      const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
      searchIndex.push({
        id,
        url,
        title: `📝: ${post.data.title}`,
        tags: post.data.tags.filter((tag) => tag !== 'posts'),
      })
      id++;
    })
  }
  if (links) {
    links.forEach((link) => {
      searchIndex.push({
        id,
        url: link.url,
        title: `🔗: ${link.title}`,
        tags: link.tags,
      })
      id++;
    })
  }
  return searchIndex
}

export const tagList = (collection) => {
  const tagsSet = new Set()
  collection.getAll().forEach((item) => {
    if (!item.data.tags) return
    item.data.tags
      .filter((tag) => !['posts', 'all'].includes(tag))
      .forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

export const tagMap = (collection) => {
  const tags = {}
  const collectionData = collection.getAll()[0]
  const posts = collectionData.data.collections.posts
  const links = collectionData.data.collections.links
  const books = collectionData.data.books

  if (posts) posts.forEach((post) => {
    const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
    const tagString = [...new Set(post.data.tags?.map((tag) => tagAliases[tag.toLowerCase()]))]
      .join(' ')
      .trim()
    if (tagString) tags[url] = tagString.replace(/\s+/g,' ')
  })

  if (links) links.forEach((link) => {
    const url = link.data.link
    const tagString = [...new Set(link.data.tags?.map((tag) => tagAliases[tag.toLowerCase()]))]
      .join(' ')
      .trim()
    if (tagString) tags[url] = tagString.replace(/\s+/g,' ')
  })

  if (books) books.forEach((book) => {
    const tagString = book['tags']?.map((tag) => tagAliases[tag.toLowerCase()])
      .join(' ')
      .trim()
    if (tagString) tags[book.url] = tagString.replace(/\s+/g,' ')
  })

  return tags
}

export const tagsSortedByCount = (collection) => {
  const tagStats = {};
  collection.getFilteredByGlob('src/posts/**/*.*').forEach((item) => {
    if (!item.data.tags) return;
    item.data.tags
      .filter((tag) => !['posts', 'all', 'politics', 'net neutrality'].includes(tag))
      .forEach((tag) => {
      if (!tagStats[tag]) tagStats[tag] = 1;
      if (tagStats[tag]) tagStats[tag] = tagStats[tag] + 1;
    });
  });
  return Object.entries(tagStats).sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key}`);
}

export const links = (collection) => collection.getFilteredByGlob('src/links/**/*.*').reverse()

export const booksToRead = (collection) => collection.getAll()[0].data.books.filter(book => book.status === 'want to read').sort((a, b) => a['title'].toLowerCase().localeCompare(b['title'].toLowerCase()))