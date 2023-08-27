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
  return pages.filter((p) => p.url.includes('posts'))
}
