module.exports = {
  getReadableData: (readable) => {
    return new Promise((resolve, reject) => {
      const chunks = []
      readable.once('error', (err) => reject(err))
      readable.on('data', (chunk) => chunks.push(chunk))
      readable.once('end', () => resolve(chunks.join('')))
    })
  },
}
