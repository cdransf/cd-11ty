const slugify = require('slugify')

const slugifyString = (str) => {
  return slugify(str, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  })
}

module.exports = {
  slugifyString,
}
