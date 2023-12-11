const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const tablerIcons = require('eleventy-plugin-tabler-icons')
const pluginUnfurl = require('eleventy-plugin-unfurl')
const pluginFilesMinifier = require('@sherby/eleventy-plugin-files-minifier')
const schema = require('@quasibit/eleventy-plugin-schema')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const embedYouTube = require('eleventy-plugin-youtube-embed')

const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')

const filters = require('./config/filters/index.js')

const CleanCSS = require('clean-css')
const { execSync } = require('child_process')

const tagAliases = require('./src/_data/json/tag-aliases.json')

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
  eleventyConfig.addPlugin(pluginFilesMinifier)
  eleventyConfig.addPlugin(schema)
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
  eleventyConfig.addShortcode('version', () => packageVersion)

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
      if (item.data.links) {
        item.data.links.forEach((link) => {
          const tagString = link['tags']
            .map((tag) => tagAliases[tag.toLowerCase()])
            .join(' ')
            .trim()
          if (tagString) tags[link.url] = tagString
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

  eleventyConfig.addShortcode('image', img)

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
