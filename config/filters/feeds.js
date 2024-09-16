import { URL } from 'url'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import sanitizeHtml from 'sanitize-html'

const BASE_URL = 'https://coryd.dev'

export default {
  normalizeEntries: (entries, limit) => {
    const posts = []
    const mdGenerator = () => {
      const md = markdownIt({ html: true, linkify: true })

      md.use(markdownItAnchor, {
        level: [1, 2],
        permalink: markdownItAnchor.permalink.headerLink({
          safariReaderFix: true
        })
      })
      md.use(markdownItFootnote)
      md.renderer.rules.footnote_ref = (tokens, idx) => {
        const id = tokens[idx].meta.id + 1
        return `<sup>${id}</sup>`
      }
      md.renderer.rules.footnote_block_open = () => (
        '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n'
      )
      md.renderer.rules.footnote_open = (tokens, idx) => {
        const id = tokens[idx].meta.id + 1
        return `<li id="fn${id}" class="footnote-item"> `
      }
      md.renderer.rules.footnote_anchor = () => ''

      return md
    }
    const entryData = limit ? entries.slice(0, limit) : entries

    entryData.forEach((entry) => {
      const md = mdGenerator()
      const dateKey = Object.keys(entry).find(key => key.includes('date'))
      let { artist, authors, backdrop, content, description, image, link, rating, review, slug, title, url, tags, type  } = entry
      const feedNote = '<hr/><p>This is a full text feed, but not all content can be rendered perfectly within the feed. If something looks off, feel free to <a href="https://coryd.dev">visit my site</a> for the original post.</p>'
      const processedEntry = { title: title.trim(), date: new Date(entry[dateKey]), content: description }

      if (url?.includes('http')) processedEntry['url'] = url
      if (!url?.includes('http')) processedEntry['url'] = new URL(url, BASE_URL).toString()
      if (slug) processedEntry['url'] = new URL(slug, BASE_URL).toString()
      if (link) {
        processedEntry['title'] = `${title} via ${authors['name']}`
        processedEntry['url'] = link,
        processedEntry['author'] = {
          name: authors['name'],
          url: authors['url'],
          mastodon: authors?.['mastodon'] || '',
          rss: authors?.['rss_feed'] || ''
        },
        processedEntry['excerpt'] = sanitizeHtml(`${md.render(description)}`)
      }
      if (description) processedEntry['excerpt'] = description
      if (['book', 'movie'].includes(type) && review) {
        processedEntry['excerpt'] = sanitizeHtml(`${md.render(review)}`)
      } else if (['book', 'movie'].includes(type)) {
        processedEntry['excerpt'] = sanitizeHtml(`${md.render(description)}`)
      }
      if (slug && content) processedEntry['excerpt'] = sanitizeHtml(`${md.render(content)}${feedNote}`, {
        disallowedTagsMode: 'completelyDiscard'
      })

      processedEntry['image'] = backdrop || image

      if (rating) processedEntry['rating'] = rating
      if (tags) processedEntry['tags'] = tags
      if (entry) posts.push(processedEntry)
    })

    return posts
  }
}