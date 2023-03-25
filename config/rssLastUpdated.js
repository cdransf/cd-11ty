const { DateTime } = require('luxon')

module.exports = (collection) => {
  if (!collection || !collection.length) return ''
  return collection[0].publishedAt
}
