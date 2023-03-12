const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const heroIcons = require('eleventy-plugin-heroicons')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItFootnote = require('markdown-it-footnote')
const filters = require('./config/filters.js')
const dateFilters = require('./config/dateFilters.js')

module.exports = function (eleventyConfig) {
    // plugins
    eleventyConfig.addPlugin(syntaxHighlight)
    eleventyConfig.addPlugin(heroIcons)

    // filters
    Object.keys(filters).forEach((filterName) => {
        eleventyConfig.addFilter(filterName, filters[filterName])
    })

    // date filters
    Object.keys(dateFilters).forEach((filterName) => {
        eleventyConfig.addFilter(filterName, dateFilters[filterName])
    })

    // enable merging of tags
    eleventyConfig.setDataDeepMerge(true)

    // copy these static files to _site folder
    eleventyConfig.addPassthroughCopy('src/assets')
    eleventyConfig.addPassthroughCopy('src/manifest.json')

    // create excerpts
    eleventyConfig.setFrontMatterParsingOptions({
        excerpt: true,
        excerpt_alias: 'post_excerpt',
        excerpt_separator: '<!-- excerpt -->',
    })

    // create a filter to determine duration of post
    eleventyConfig.addFilter('readTime', (value) => {
        const content = value
        const textOnly = content.replace(/(<([^>]+)>)/gi, '')
        const readingSpeedPerMin = 450
        return Math.max(1, Math.floor(textOnly.length / readingSpeedPerMin))
    })

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

    // asset_img shortcode
    eleventyConfig.addLiquidShortcode('asset_img', (filename, alt) => {
        return `<img class="my-4" src="/assets/img/posts/${filename}" alt="${alt}" />`
    })

    return {
        dir: {
            input: 'src',
        },
    }
}
