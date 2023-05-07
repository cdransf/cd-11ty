const ALBUM_DENYLIST = ['no-love-deep-web']

module.exports = {
  artist: (media) =>
    `https://cdn.coryd.dev/artists/${media.replace(/\s+/g, '-').toLowerCase()}.jpg`,
  album: (media) => {
    return !ALBUM_DENYLIST.includes(media.name.replace(/\s+/g, '-').toLowerCase())
      ? media.image[media.image.length - 1]['#text']
      : `https://cdn.coryd.dev/artists/${media.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
  },
}
