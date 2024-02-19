import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const metaData = require('./json/meta.json')

export default async function () {
  return metaData
}
