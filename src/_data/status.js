const fetch = require('node-fetch')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://api.omg.lol/address/cory/statuses/'
    const asset = new AssetCache('status_data')
    if (asset.isCacheValid('1h')) return await asset.getCachedValue()
    const status = await fetch(url).then((res) => res.json())
    await asset.save(status, 'json')
    return status.response.statuses[0]
}
