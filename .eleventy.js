import dotenvFlow from 'dotenv-flow'
import filters from './config/filters/index.js'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItPrism from 'markdown-it-prism'
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { resolve } from 'path';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import tablerIcons from '@cdransf/eleventy-plugin-tabler-icons'
import { albumReleasesCalendar } from './config/collections/index.js'

// load .env
dotenvFlow.config()

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)

  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')
  eleventyConfig.addPassthroughCopy('_headers')

  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: '.11ty-vite',
    viteOptions: {
      clearScreen: false,
			appType: 'mpa',
      server: {
				middlewareMode: true,
			},
      assetsInclude: ['src/assets/fonts/*.woff2'],
      build: {
        emptyOutDir: true,
        rollupOptions: {
          external: ['/js/script.js'],
          input: {
            main: resolve('./src/assets/index.js'),
          },
          output: {
            assetFileNames: 'assets/css/[name][extname]',
						chunkFileNames: 'assets/js/[name].[hash].js',
						entryFileNames: 'assets/js/[name].[hash].js'
          },
        },
        resolve: {
          alias: {
            'api-text': resolve('./node_modules/@cdransf/api-text/api-text.js'),
            'select-pagination': resolve('./node_modules/@cdransf/select-pagination/select-pagination.js'),
            'mastodon-post': resolve('./node_modules/@daviddarnes/mastodon-post/mastodon-post.js'),
            'mini-search': resolve('./node_modules/minisearch/dist/umd/index.js'),
            'theme-toggle': resolve('./node_modules/@cdransf/theme-toggle/theme-toggle.js'),
            'youtube-video-element': resolve('./node_modules/youtube-video-element/youtube-video-element.js'),
          },
        },
      },
      plugins: [ViteMinifyPlugin({})],
    },
  })

  eleventyConfig.setServerOptions({ domdiff: false })
  eleventyConfig.setWatchThrottleWaitTime(200)
  eleventyConfig.setQuietMode(true)
  eleventyConfig.configureErrorReporting({ allowMissingExtensions: true })
  eleventyConfig.setLiquidOptions({ jsTruthy: true })

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