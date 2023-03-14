const fetch = require('node-fetch')
const { AssetCache } = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/music?limit=1&period=7day'
    const asset = new AssetCache('now_playing_data')
    if (asset.isCacheValid('3m')) return await asset.getCachedValue()
    const nowPlaying = await fetch(url).then((res) => res.json())
    await asset.save(nowPlaying, 'json')
    return {
        artist: nowPlaying.recenttracks.track[0].artist['#text'],
        title: nowPlaying.recenttracks.track[0].name,
        url: nowPlaying.recenttracks.track[0].url,
    }
}
