const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://api.omg.lol/address/cory/statuses/'
    const res = EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    })
    const status = await res
    return status.response.statuses[0]
}
