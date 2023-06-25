module.exports = {
  artist: (media) =>
    `https://cdn.coryd.dev/artists/${media.replace(/\s+/g, '-').toLowerCase()}.jpg` ||
    'https://cdn.coryd.dev/artists/missing-artist.jpg',
  tv: (episode) =>
    `https://cdn.coryd.dev/tv/${episode.replace(':', '').replace(/\s+/g, '-').toLowerCase()}.jpg` ||
    'https://cdn.coryd.dev/tv/missing-tv.jpg',
  cdn: (url, host, cdn) => {
    return url.replace(host, cdn)
  },
}
