const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const url = 'https://utils.coryd.dev/api/now?endpoints=artists,albums,books,movies,tv'
    const res = EleventyFetch(url, {
        duration: '3h',
        type: 'json',
    })
    const now = await res
    return {
        artists: now.artists,
        albums: now.albums,
        books: now.books,
        movies: now.movies,
        tv: now.tv,
    }
}
