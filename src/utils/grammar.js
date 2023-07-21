const titleCaseExceptions = require('./../_data/json/title-case-exceptions.json')

module.exports = {
  /**
   * Accepts a string that is then transformed to title case and returned.
   *
   * @name titleCase
   * @param {string} string
   * @returns {string}
   */
  titleCase: (string) => {
    if (!string) return ''
    return string
      .toLowerCase()
      .split(' ')
      .map((word, i) => {
        return titleCaseExceptions.exceptions.includes(word) && i !== 0
          ? word
          : word.charAt(0).toUpperCase().concat(word.substring(1))
      })
      .join(' ')
  },
}
