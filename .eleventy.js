const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const tablerIcons = require('eleventy-plugin-tabler-icons')
const pluginUnfurl = require('eleventy-plugin-unfurl')
const pluginFilesMinifier = require('@sherby/eleventy-plugin-files-minifier')
const schema = require('@quasibit/eleventy-plugin-schema')
const { eleventyImagePlugin } = require('@11ty/eleventy-img')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const outdent = require('outdent')
const Image = require('@11ty/eleventy-img')
const embedYouTube = require('eleventy-plugin-youtube-embed')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')
const filters = require('./config/filters.js')
const dateFilters = require('./config/dateFilters.js')
const mediaFilters = require('./config/mediaFilters.js')
const feedFilters = require('./config/feedFilters.js')
const CleanCSS = require('clean-css')
const now = String(Date.now())
const { execSync } = require('child_process')
const tagAliases = require('./src/_data/json/tag-aliases.json')

// load .env
require('dotenv-flow').config()

const imageShortcode = async (
  src,
  alt,
  className = undefined,
  loading = 'lazy',
  widths = [75, 150, 300, 600, 900, 1200],
  formats = ['webp', 'jpeg'],
  sizes = '100vw'
) => {
  const imageMetadata = await Image(src, {
    widths: [...widths, null],
    formats: [...formats, null],
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/',
  })

  const stringifyAttributes = (attributeMap) => {
    return Object.entries(attributeMap)
      .map(([attribute, value]) => {
        if (typeof value === 'undefined') return ''
        return `${attribute}="${value}"`
      })
      .join(' ')
  }

  const sourceHtmlString = Object.values(imageMetadata)
    .map((images) => {
      const { sourceType } = images[0]
      const sourceAttributes = stringifyAttributes({
        type: sourceType,
        srcset: images.map((image) => image.srcset).join(', '),
        sizes,
      })

      return `<source ${sourceAttributes}>`
    })
    .join('\n')

  const getLargestImage = (format) => {
    const images = imageMetadata[format]
    return images[images.length - 1]
  }

  const largestUnoptimizedImg = getLargestImage(formats[0])
  const imgAttributes = stringifyAttributes({
    src: largestUnoptimizedImg.url,
    width: largestUnoptimizedImg.width,
    height: largestUnoptimizedImg.height,
    alt,
    loading,
    decoding: 'async',
  })

  const imgHtmlString = `<img ${imgAttributes}>`
  const pictureAttributes = stringifyAttributes({
    class: className,
  })

  const picture = `<picture ${pictureAttributes}>
    ${sourceHtmlString}
    ${imgHtmlString}
  </picture>`

  return outdent`${picture}`
}

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

  eleventyConfig.addCollection('tagMap', (collection) => {
    const tags = {}
    collection.getAll().forEach((item) => {
      if (item.data.collections.posts) {
        item.data.collections.posts.forEach((post) => {
          const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
          const tagString = [...new Set(post.data.tags.map((tag) => tagAliases[tag.toLowerCase()]))]
            .join(' ')
            .trim()
          if (tagString) tags[url] = tagString
        })
      }
    })
    return tags
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

  // feed filters
  Object.keys(feedFilters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, feedFilters[filterName])
  })

  // css filters
  eleventyConfig.addFilter('cssmin', (code) => new CleanCSS({}).minify(code).styles)

  // rss filters
  eleventyConfig.addLiquidFilter('dateToRfc822', pluginRss.dateToRfc822)
  eleventyConfig.addLiquidFilter('absoluteUrl', pluginRss.absoluteUrl)

  // image shortcode
  eleventyConfig.addShortcode('image', imageShortcode)

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
