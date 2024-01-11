import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const mastodonCache = require('../../cache/jsonfeed-to-mastodon.json')

export default async function () {
  return mastodonCache
}