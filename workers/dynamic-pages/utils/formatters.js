import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const md = markdownIt({ html: true, linkify: true });

md.use(markdownItAnchor, {
  level: [1, 2],
  permalink: markdownItAnchor.permalink.headerLink({
    safariReaderFix: true,
  }),
});
md.use(markdownItFootnote);