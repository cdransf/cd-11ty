const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const tablerIcons = require('eleventy-plugin-tabler-icons')
const pluginUnfurl = require('eleventy-plugin-unfurl')
const pluginFilesMinifier = require('@sherby/eleventy-plugin-files-minifier')
const schema = require('@quasibit/eleventy-plugin-schema')
const { eleventyImagePlugin } = require('@11ty/eleventy-img')
const Image = require('@11ty/eleventy-img')
const embedYouTube = require('eleventy-plugin-youtube-embed')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')
const filters = require('./config/filters.js')
const dateFilters = require('./config/dateFilters.js')
const mediaFilters = require('./config/mediaFilters.js')
const CleanCSS = require('clean-css')
const now = String(Date.now())
const { execSync } = require('child_process')

// load .env
require('dotenv-flow').config()

module.exports = function (eleventyConfig) {
  // plugins
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)
  eleventyConfig.addPlugin(pluginUnfurl)
  eleventyConfig.addPlugin(pluginFilesMinifier)
  eleventyConfig.addPlugin(schema)
  eleventyConfig.addPlugin(eleventyImagePlugin)
  eleventyConfig.addPlugin(embedYouTube, {
    modestBranding: true,
    lite: {
      'lite.css.path': 'src/assets/styles/yt-lite.css',
      'lite.js.path': 'src/assets/scripts/yt-lite.js',
    },
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
  eleventyConfig.addShortcode('version', () => now)

  // enable merging of tags
  eleventyConfig.setDataDeepMerge(true)

  // create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->',
  })

  // md instance
  const md = markdownIt({ html: true, linkify: true })

  // enable us to iterate over all the tags, excluding posts and all
  eleventyConfig.addCollection('tagList', (collection) => {
    const tagsSet = new Set()
    collection.getAll().forEach((item) => {
      if (!item.data.tags) return
      item.data.tags
        .filter((tag) => !['posts', 'all'].includes(tag))
        .forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  md.use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
      class: 'header-anchor',
    }),
  })
  md.use(markdownItFootnote)
  eleventyConfig.setLibrary('md', md)

  // markdown filter
  eleventyConfig.addLiquidFilter('markdown', (content) => {
    if (!content) return
    return md.render(content)
  })

  // filters
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName])
  })

  // date filters
  Object.keys(dateFilters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, dateFilters[filterName])
  })

  // media filters
  Object.keys(mediaFilters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, mediaFilters[filterName])
  })

  // css filters
  eleventyConfig.addFilter('cssmin', (code) => new CleanCSS({}).minify(code).styles)

  // image shortcode
  eleventyConfig.addShortcode('image', async function (src, alt, css, sizes, loading) {
    let metadata = await Image(src, {
      widths: [75, 150, 300, 600],
      formats: ['webp'],
      urlPath: '/assets/img/cache/',
      outputDir: './_site/assets/img/cache/',
    })

    let imageAttributes = {
      class: css,
      alt,
      sizes,
      loading: loading || 'lazy',
      decoding: 'async',
    }

    return Image.generateHTML(metadata, imageAttributes)
  })

  eleventyConfig.on('eleventy.after', () => {
    execSync(`npx pagefind --source _site --glob "**/*.html"`, { encoding: 'utf-8' })
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
