module.exports = {
  normalizeMedia: (media) =>
    media.map((item) => {
      let normalized = {
        image: item['image'],
        url: item['url'],
      }
      if (item.type === 'album') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} by ${item['artist']}`
        normalized['subtext'] = item['artist']
      }
      if (item.type === 'artist') {
        normalized['title'] = item['title']
        normalized['subtext'] = `${item['plays']} plays`
      }
      if (item.type === 'book') normalized['alt'] = item['title']
      if (item.type === 'movie') normalized['title'] = item['title']
      if (item.type === 'tv') {
        normalized['title'] = item['title']
        normalized['subtext'] = `${item.name} • <strong>${item.episode}</strong>`
      }
      return normalized
    }),
}
