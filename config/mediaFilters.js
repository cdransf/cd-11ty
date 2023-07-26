const ALBUM_DENYLIST = ['no-love-deep-web', 'unremittance']

module.exports = {
  artist: (media) =>
    `https://cdn.coryd.dev/artists/${media.replace(/\s+/g, '-').toLowerCase()}.jpg` ||
    'https://cdn.coryd.dev/artists/missing-artist.jpg',
  album: (media) => {
    return !ALBUM_DENYLIST.includes(media.name.replace(/\s+/g, '-').toLowerCase())
      ? media.replace('https://lastfm.freetls.fastly.net', 'https://albums.coryd.dev')
      : `https://cdn.coryd.dev/albums/${media.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
  },
  tv: (episode) =>
    `https://cdn.coryd.dev/tv/${episode.replace(':', '').replace(/\s+/g, '-').toLowerCase()}.jpg` ||
    'https://cdn.coryd.dev/tv/missing-tv.jpg',
  cdn: (url, host, cdn) => {
    return url.replace(host, cdn)
  },
}
