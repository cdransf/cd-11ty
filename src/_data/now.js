const fetch = require('node-fetch')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/now?endpoints=artists,albums,books,movies,tv'
    const asset = new AssetCache('now_data')
    if (asset.isCacheValid('1h')) return await asset.getCachedValue()
    const now = await fetch(url).then((res) => res.json())
    await asset.save(now, 'json')
    return {
        artists: now.artists,
        albums: now.albums,
        books: now.books,
        movies: now.movies,
        tv: now.tv,
    }
}
