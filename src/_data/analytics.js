const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const SITE_ID_CLICKY = process.env.SITE_ID_CLICKY
  const SITE_KEY_CLICKY = process.env.SITE_KEY_CLICKY
  const url = `https://api.clicky.com/api/stats/4?site_id=${SITE_ID_CLICKY}&sitekey=${SITE_KEY_CLICKY}&type=pages&output=json`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  const pages = data[0].dates[0].items
    .filter((p) => p.url.includes('posts'))
    .filter((p) => !p.url.includes('/null'))
    .map((page) => {
      return {
        title: page.title,
        rank: parseInt(page.value),
        url: page.url.split('?')[0],
      }
    })
  const postsObj = {}
  pages.forEach((page) => {
    if (postsObj[page.url]) {
      postsObj[page.url].rank += postsObj[page.url].rank
    } else {
      postsObj[page.url] = page
    }
  })
  return Object.values(postsObj)
}
