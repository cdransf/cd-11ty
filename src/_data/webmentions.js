const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const KEY_CORYD = process.env.API_KEY_WEBMENTIONS_CORYD_DEV
  if (!KEY_CORYD) return
  const url = `https://webmention.io/api/mentions.jf2?token=${KEY_CORYD}&per-page=1000`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  })
  const webmentions = await res
  return {
    mentions: webmentions.children,
  }
}
