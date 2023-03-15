const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/webmentions'
    const res = EleventyFetch(url, {
        duration: '1h',
        type: 'json',
    })
    const webmentions = await res
    return {
        mentions: webmentions.children,
    }
}
