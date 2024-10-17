import truncateHtml from 'truncate-html'
import { shuffleArray } from '../utilities/index.js'

export default {
  encodeAmp: (string) => {
    if (!string) return
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  replaceQuotes: (string) => string.replace(/"/g, '&quot;'),
  formatNumber: (number) => number.toLocaleString('en-US'),
  htmlTruncate: (content, limit = 50) => truncateHtml(content, limit, {
    byWords: true,
    ellipsis: '...'
  }),
  shuffleArray,
}