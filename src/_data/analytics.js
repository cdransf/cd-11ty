import EleventyFetch from '@11ty/eleventy-fetch'
import AnalyticsMock from './json/mocks/analytics.js'

export default async function () {
  const API_KEY_PLAUSIBLE = process.env.API_KEY_PLAUSIBLE
  const url =
    'https://plausible.io/api/v1/stats/breakdown?site_id=coryd.dev&period=6mo&property=event:page&limit=30'
  let pages;
  if (process.env.ELEVENTY_PRODUCTION) {
    const res = EleventyFetch(url, {
      duration: '1h',
      type: 'json',
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${API_KEY_PLAUSIBLE}`,
        },
      },
    }).catch()
    pages = await res
  } else {
    pages = AnalyticsMock
  }
  return pages.results.filter((p) => p.page.includes('posts'))
}
