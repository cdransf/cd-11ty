import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import tablerIcons from '@cdransf/eleventy-plugin-tabler-icons'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import filters from './config/filters/index.js'
import { copyErrorPages } from './config/events/index.js'
import { processContent, albumReleasesCalendar } from './config/collections/index.js'
import { DateTime } from 'luxon'

// load .env
import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

// get app version
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const appVersion = require('./package.json').version

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)

  // quiet build output
  eleventyConfig.setQuietMode(true)

  // template options
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
  })

  // passthrough
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')
  eleventyConfig.addPassthroughCopy('_headers')
  eleventyConfig.addPassthroughCopy({
    'node_modules/minisearch/dist/umd/index.js': 'assets/scripts/components/minisearch.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/api-text/api-text.js': 'assets/scripts/components/api-text.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/theme-toggle/theme-toggle.js': 'assets/scripts/components/theme-toggle.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/select-pagination/select-pagination.js': 'assets/scripts/components/select-pagination.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/youtube-video-element/youtube-video-element.js': 'assets/scripts/components/youtube-video-element.js'
  })

  // collections
  eleventyConfig.addCollection('allContent', (collection) => {
    const { allContent } = processContent(collection)
    return allContent
  })
  eleventyConfig.addCollection('searchIndex', (collection) => {
    const { searchIndex } = processContent(collection)
    return searchIndex
  })
  eleventyConfig.addCollection('siteMap', (collection) => {
    const { siteMap } = processContent(collection)
    return siteMap
  })
  eleventyConfig.addCollection('albumReleasesCalendar', albumReleasesCalendar)

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
    }),
  })
  md.use(markdownItFootnote)
  eleventyConfig.setLibrary('md', md)

  // filters
  eleventyConfig.addLiquidFilter('markdown', (content) => {
    if (!content) return
    return md.render(content)
  })

  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName])
  })

  // shortcodes
  eleventyConfig.addShortcode('appVersion', () => appVersion)
  eleventyConfig.addShortcode('currentYear', () => DateTime.now().year)

  // events
  eleventyConfig.on('afterBuild', copyErrorPages)

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: 'includes',
      data: 'data',
      output: '_site',
    },
  }
}