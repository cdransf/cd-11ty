import fs from 'fs'
import path from 'path'

const errorPages = ['404', '500', '1000', 'broken', 'error', 'js-challenge', 'not-allowed', 'rate-limit']

export const copyErrorPages = () => {
  errorPages.forEach((errorPage) => {
    const sourcePath = path.join('_site', errorPage, 'index.html')
    const destinationPath = path.join('_site', `${errorPage}.html`)
    const directoryPath = path.join('_site', errorPage)

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error(`Error copying ${errorPage} page:`, err)
        return
      }

      fs.unlink(sourcePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Error deleting source file for ${errorPage} page:`, unlinkErr)
          return
        }

        fs.rmdir(directoryPath, (rmdirErr) => {
          if (rmdirErr) console.error(`Error removing directory for ${errorPage} page:`, rmdirErr)
        })
      })
    })
  })
}
