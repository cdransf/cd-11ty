import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const components = [
  { src: '@cdransf/api-text/api-text.js', dest: 'api-text.js' },
  { src: '@cdransf/select-pagination/select-pagination.js', dest: 'select-pagination.js' },
  { src: '@daviddarnes/mastodon-post/mastodon-post.js', dest: 'mastodon-post.js' },
  { src: 'minisearch/dist/es/index.js', dest: 'mini-search.js' },
  { src: '@cdransf/theme-toggle/theme-toggle.js', dest: 'theme-toggle.js' },
  { src: 'youtube-video-element/youtube-video-element.js', dest: 'youtube-video-element.js' }
]

const destDir = path.resolve(__dirname, '../src/assets/js/components')

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
  console.log(`Created directory: ${destDir}`)
}

components.forEach(({ src, dest }) => {
  const srcPath = path.resolve(__dirname, '../node_modules', src)
  const destPath = path.join(destDir, dest)

  fs.copyFile(srcPath, destPath, err => {
    if (err) console.error(`Failed to copy ${src}:`, err)
    else console.log(`Copied ${src} to ${destPath}`)
  })
})