import { URL } from 'url'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import sanitizeHtml from 'sanitize-html'
import truncate from 'truncate-html'

const BASE_URL = 'https://coryd.dev'

export default {
  normalizeEntries: (entries, limit) => {
    const posts = []
    const mdGenerator = () => {
      const md = markdownIt({ html: true, linkify: true })
      md.use(markdownItAnchor, {
        level: [1, 2],
        permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true })
      })
      md.use(markdownItFootnote)
      md.renderer.rules.footnote_ref = (tokens, idx) => `<sup>${tokens[idx].meta.id + 1}</sup>`
      md.renderer.rules.footnote_block_open = () => '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n'
      md.renderer.rules.footnote_open = (tokens, idx) => `<li id="fn${tokens[idx].meta.id + 1}" class="footnote-item"> `
      md.renderer.rules.footnote_anchor = () => ''

      return md
    }

    const entryData = limit ? entries.slice(0, limit) : entries
    entryData.forEach((entry) => {
      const md = mdGenerator()
      const dateKey = Object.keys(entry).find(key => key.includes('date'))
      const {
        artist, authors, backdrop, content, description, image, link, rating, review,
        slug, title, url, tags, type
      } = entry

      const processedEntry = {
        title: title.trim(),
        date: new Date(entry[dateKey]),
        content: description || ''
      }
      const feedNote = '<hr/><p>This is a full text feed, but not all content can be rendered perfectly within the feed. If something looks off, feel free to <a href="https://coryd.dev">visit my site</a> for the original post.</p>'

      processedEntry.url = (url?.includes('http')) ? url : new URL(slug || url, BASE_URL).toString()

      if (link) {
        processedEntry.title = `${title} via ${authors?.name || 'Unknown'}`
        processedEntry.url = link
        processedEntry.author = {
          name: authors?.name || 'Unknown',
          url: authors?.url || '',
          mastodon: authors?.mastodon || '',
          rss: authors?.rss_feed || ''
        }
        processedEntry.excerpt = sanitizeHtml(md.render(description || ''))
      } else if (['book', 'movie'].includes(type)) {
        processedEntry.excerpt = sanitizeHtml(md.render(review || description || ''))
      } else if (type === 'album-release') {
        let sanitizedDescription = sanitizeHtml(md.render(description || ''))
        let truncatedDescription = truncate(sanitizedDescription, { length: 500, reserveLastWord: true, ellipsis: '...' })
        if (sanitizedDescription.length > 500) truncatedDescription += ` <p><a href="${artist?.url}">Read more about ${artist?.name}</a></p>`
        processedEntry.excerpt = truncatedDescription
      } else if (slug && content) {
        processedEntry.excerpt = sanitizeHtml(md.render(content) + feedNote, { disallowedTagsMode: 'completelyDiscard' })
      } else if (description) {
        processedEntry.excerpt = description
      }

      processedEntry.image = backdrop || image

      if (rating) processedEntry.rating = rating
      if (tags) processedEntry.tags = tags
      if (type === 'album-release' && artist) processedEntry.title = `${title} by ${artist['name']}`

      posts.push(processedEntry)
    })

    return posts
  }
}