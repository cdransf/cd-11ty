const artistAliases = require('../_data/json/artist-aliases.json')

module.exports = {
  /**
   * Accepts a string representing an artist name, checks to see if said artist name
   * exists in an artist alias group of shape string[]. If so, replaces the provided
   * artist name with the canonical artist name.
   *
   * @name aliasArtist
   * @param {string} artist
   * @returns {string}
   */
  aliasArtist: (artist) => {
    const aliased = artistAliases.aliases.find((alias) => alias.aliases.includes(artist))
    if (aliased) artist = aliased.artist
    return artist
  },

  /**
   * Accepts a media name represented as a string (album or song name) and replaces
   * matches in the `denyList` with an empty string before returning the result.
   *
   * @name sanitizeMedia
   * @param {string} media
   * @returns {string}
   */
  sanitizeMedia: (media) => {
    const denyList =
      /-\s*(?:single|ep)\s*|(\[|\()(Deluxe|Special|Remastered|Full Dynamic Range|Expanded)(?:\s+\d+(?:th|nd|rd|st)? Anniversary)?(?:\s+Edition)?(\]|\))/gi
    return media.replace(denyList, '').trim()
  },

  /**
   * Sorts an array of media objects by the number of plays in descending order.
   *
   * @name sortByPlays
   * @param {Array} array - an array of media objects.
   * @returns {Array} - a new array sorted by the number of plays in descending order.
   */
  sortByPlays: (array) => Object.values(array).sort((a, b) => b.plays - a.plays).map((media, index) => media.rank = index + 1),
}
