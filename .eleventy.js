const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const heroIcons = require('eleventy-plugin-heroicons')
const pluginUnfurl = require('eleventy-plugin-unfurl')
const pluginFilesMinifier = require('@sherby/eleventy-plugin-files-minifier')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')
const filters = require('./config/filters.js')
const dateFilters = require('./config/dateFilters.js')
const mediaFilters = require('./config/mediaFilters.js')
const now = String(Date.now())

// load .env
require('dotenv-flow').config()

module.exports = function (eleventyConfig) {
    // plugins
    eleventyConfig.addPlugin(syntaxHighlight)
    eleventyConfig.addPlugin(heroIcons)
    eleventyConfig.addPlugin(pluginUnfurl)
    eleventyConfig.addPlugin(pluginFilesMinifier)

    // tailwind watches
    eleventyConfig.addWatchTarget('./tailwind.config.js')
    eleventyConfig.addWatchTarget('./tailwind.css')

    // passthrough
    eleventyConfig.addPassthroughCopy('src/assets')
    eleventyConfig.addPassthroughCopy('src/robots.txt')
    eleventyConfig.addPassthroughCopy('src/contribute.json')

    // shortcodes
    eleventyConfig.addShortcode('version', () => now)

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
        return md.render(content)
    })

    // asset_img shortcode
    eleventyConfig.addLiquidShortcode('asset_img', (filename, alt) => {
        return `<img class="my-4" src="/assets/img/posts/${filename}" alt="${alt}" />`
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
