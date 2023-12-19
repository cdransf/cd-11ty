const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const tablerIcons = require('eleventy-plugin-tabler-icons')
const pluginUnfurl = require('eleventy-plugin-unfurl')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const embedYouTube = require('eleventy-plugin-youtube-embed')
const postGraph = require('@rknightuk/eleventy-plugin-post-graph')

const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')

const filters = require('./config/filters/index.js')
const { slugifyString } = require('./config/utils')
const { svgToJpeg } = require('./config/events/index.js')
const { tagList, tagMap, postStats } = require('./config/collections/index.js')

const CleanCSS = require('clean-css')
const { execSync } = require('child_process')

// load .env
require('dotenv-flow').config()

/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */

const packageVersion = require('./package.json').version

// module import shortcodes
const { img } = require('./config/shortcodes/index.js')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)
  eleventyConfig.addPlugin(pluginUnfurl)
  eleventyConfig.addPlugin(embedYouTube, {
    modestBranding: true,
    lite: {
      'lite.css.path': 'src/assets/styles/yt-lite.css',
      'lite.js.path': 'src/assets/scripts/yt-lite.js',
    },
  })
  eleventyConfig.addPlugin(postGraph, {
    boxColorLight: '#e5e7eb',
    highlightColorLight: '#2563eb',
    textColorLight: '#1f2937',

    boxColorDark: '#374151',
    highlightColorDark: '#60a5fa',
    textColorDark: '#fff',
  })

  // quiet build output
  eleventyConfig.setQuietMode(true)
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
  })

  // tailwind watches
  eleventyConfig.addWatchTarget('./tailwind.config.js')
  eleventyConfig.addWatchTarget('./tailwind.css')

  // passthrough
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')

  // shortcodes
  eleventyConfig.addShortcode('version', () => packageVersion)

  // enable merging of tags
  eleventyConfig.setDataDeepMerge(true)

  // create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->',
  })

  // collections
  eleventyConfig.addCollection('tagList', tagList)
  eleventyConfig.addCollection('tagMap', tagMap)
  eleventyConfig.addCollection('postStats', postStats)

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
      class: 'header-anchor',
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
  eleventyConfig.addLiquidFilter('dateToRfc822', pluginRss.dateToRfc822)
  eleventyConfig.addLiquidFilter('absoluteUrl', pluginRss.absoluteUrl)
  eleventyConfig.addFilter('cssmin', (code) => new CleanCSS({}).minify(code).styles)
  eleventyConfig.addFilter('slugify', slugifyString)

  // shortcodes
  eleventyConfig.addShortcode('image', img)

  // transforms
  eleventyConfig.addPlugin(require('./config/transforms/html-config.js'))

  // events
  eleventyConfig.on('afterBuild', svgToJpeg)
  eleventyConfig.on('eleventy.after', () => {
    execSync(`npx pagefind --site _site --glob "**/*.html"`, { encoding: 'utf-8' })
  })

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  }
}
