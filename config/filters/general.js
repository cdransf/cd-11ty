import sanitizeHtml from 'sanitize-html'
import { shuffleArray } from '../utilities/index.js'

const BASE_URL = 'https://coryd.dev'

export default {
  encodeAmp: (string) => {
    if (!string) return
    const pattern = /&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g
    const replacement = '&amp;'
    return string.replace(pattern, replacement)
  },
  formatNumber: (number) => number.toLocaleString('en-US'),
  shuffleArray,
  sanitizeHtml: (html) => sanitizeHtml(html, {
    textFilter: (text) => text.replace(/"/g, '')
  }),
  absoluteUrl: (url) => (new URL(url, BASE_URL)).toString(),
}