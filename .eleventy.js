import { createRequire } from 'module'
import dotenvFlow from 'dotenv-flow'
import filters from './config/filters/index.js'
import htmlmin from 'html-minifier-terser'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItPrism from 'markdown-it-prism'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import tablerIcons from '@cdransf/eleventy-plugin-tabler-icons'
import { copyErrorPages, minifyJsComponents } from './config/events/index.js'
import { albumReleasesCalendar } from './config/collections/index.js'
import { cssConfig } from './config/plugins/css-config.js'

// load .env
dotenvFlow.config()

// get app version
const require = createRequire(import.meta.url)
const appVersion = require('./package.json').version

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)
  if (process.env.ELEVENTY_PRODUCTION) eleventyConfig.addPlugin(cssConfig)

  eleventyConfig.setQuietMode(true)
  eleventyConfig.configureErrorReporting({ allowMissingExtensions: true })
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
  })

  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')
  eleventyConfig.addPassthroughCopy('_headers')
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/api-text/api-text.js': 'assets/scripts/components/api-text.js',
    'node_modules/@cdransf/select-pagination/select-pagination.js': 'assets/scripts/components/select-pagination.js',
    'node_modules/@cdransf/theme-toggle/theme-toggle.js': 'assets/scripts/components/theme-toggle.js',
    'node_modules/@daviddarnes/mastodon-post/mastodon-post.js': 'assets/scripts/components/mastodon-post.js',
    'node_modules/minisearch/dist/umd/index.js': 'assets/scripts/components/minisearch.js',
    'node_modules/youtube-video-element/youtube-video-element.js': 'assets/scripts/components/youtube-video-element.js'
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
  md.use(markdownItPrism)
  eleventyConfig.setLibrary('md', md)

  eleventyConfig.addLiquidFilter('markdown', (content) => {
    if (!content) return
    return md.render(content)
  })

  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName])
  })

  eleventyConfig.addShortcode('appVersion', () => appVersion)

  // events
  if (process.env.ELEVENTY_PRODUCTION) eleventyConfig.on('afterBuild', copyErrorPages)
  if (process.env.ELEVENTY_PRODUCTION) eleventyConfig.on('afterBuild', minifyJsComponents)

  // transforms
  if (process.env.ELEVENTY_PRODUCTION) eleventyConfig.addTransform('html-minify', (content, path) => {
    if (path && path.endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        includeAutoGeneratedTags: false,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        noNewlinesBeforeTagClose: true,
        quoteCharacter: '"',
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true,
        processScripts: ['application/ld+json'],
      })
    }
    return content
  })

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