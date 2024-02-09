import EleventyFetch from '@11ty/eleventy-fetch'
import StatusMock from './json/mocks/status.js'

export default async function () {
  const url = 'https://api.omg.lol/address/cory/statuses/'
  if (process.env.ELEVENTY_PRODUCTION) {
    const res = EleventyFetch(url, {
      duration: '1h',
      type: 'json',
    }).catch()
    const status = await res
    return status.response['statuses'][0]
  } else {
    return StatusMock
  }
}
