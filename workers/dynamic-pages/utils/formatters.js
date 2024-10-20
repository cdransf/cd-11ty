import markdownIt from "markdown-it";

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
export const md = markdownIt({ html: true, linkify: true });
