const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
  const API_KEY_FATHOM = process.env.API_KEY_FATHOM
  const url =
    'https://api.usefathom.com/v1/aggregations?entity=pageview&entity_id=RBCOWZTA&aggregates=pageviews&field_grouping=pathname&sort_by=pageviews:desc&limit=10'
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${API_KEY_FATHOM}`,
      },
    },
  }).catch()
  const pages = await res
  return pages.filter((p) => p.pathname.includes('posts'))
}
