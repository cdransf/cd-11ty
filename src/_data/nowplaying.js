const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/music?limit=1&period=7day'
    const res = EleventyFetch(url, {
        duration: '10m',
        type: 'json',
    })
    const music = await res
    return {
        artist: music.recenttracks.track[0].artist['#text'],
        title: music.recenttracks.track[0].name,
        url: music.recenttracks.track[0].url,
    }
}
