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
        normalized['alt'] = `${item['title']} at #${item['rank']}`
        normalized['subtext'] = `#${item['rank']}`
      }
      if (item.type === 'movie') normalized['alt'] = item['title']
      if (item.type === 'book') {
        normalized['alt'] = `${item['title']} by ${item['author']}`
        normalized['subtext'] = `${item['percentage']} finished`
        normalized['percentage'] = item['percentage']
      }
      if (item.type === 'tv') {
        normalized['title'] = item['title']
        normalized['alt'] = `${item['title']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      if (item.type === 'tv-range') {
        normalized['title'] = item['name']
        normalized['alt'] = `${item['subtext']} from ${item['name']}`
        normalized['subtext'] = item['subtext']
      }
      return normalized
    }),
}
