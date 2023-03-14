const fetch = require('node-fetch')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/webmentions'
    const asset = new AssetCache('webmentions_data')
    if (asset.isCacheValid('1h')) return await asset.getCachedValue()
    const webmentions = await fetch(url).then((res) => res.json())
    await asset.save(webmentions, 'json')
    return {
        mentions: webmentions.children,
    }
}
