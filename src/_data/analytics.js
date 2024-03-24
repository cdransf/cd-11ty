import EleventyFetch from '@11ty/eleventy-fetch'

export default async function () {
  const API_KEY_NETLIFY = process.env.API_KEY_NETLIFY
  const SITE_ID = process.env.SITE_ID
  const endDate = new Date();
  const startDate = new Date(new Date().setDate(endDate.getDate() - 30));
  const timezoneOffset = new Date().getTimezoneOffset() / 60;
  const url =
    `https://analytics.services.netlify.com/v2/${SITE_ID}/ranking/pages?from=${startDate.getTime()}&to=${endDate.getTime()}&timezone=-0${timezoneOffset}00&limit=50`
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${API_KEY_NETLIFY}`,
      },
    },
  }).catch()
  const responseObject = await res
  const pages = responseObject['data']
  return pages.filter((p) => p.resource.includes('posts'))
}
