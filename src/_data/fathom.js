const fs = require('fs')
const fetch = require('node-fetch')

module.exports = async function () {
  const sourceUrl = 'https://cdn.usefathom.com/script.js'

  fetch(sourceUrl)
    .then((response) => response.text())
    .then((sourceContent) => {
      if (!sourceContent.includes('fathomScript.src.indexOf("cdn.usefathom.com")'))
        throw new Error('Fathom script changed!')
      const modifiedContent = sourceContent.replace(
        'fathomScript.src.indexOf("cdn.usefathom.com")',
        'fathomScript.src.indexOf("coryd.dev")'
      )
      const newFilePath = './_site/script.js'
      fs.writeFile(newFilePath, modifiedContent, (err) => {
        if (err) console.log(err)
      })
    })
    .catch((err) => {
      console.error('Error downloading the file:', err)
    })
}
