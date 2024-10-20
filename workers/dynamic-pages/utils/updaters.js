import { parseHTML } from "linkedom";

export const updateDynamicContent = (html, metadata, mediaHtml) => {
  const { document } = parseHTML(html);

  const titleTag = document.querySelector('title[data-dynamic="title"]');
  if (titleTag) titleTag["textContent"] = metadata["title"];

  const dynamicMetaSelectors = [
    {
      selector: 'meta[data-dynamic="description"]',
      attribute: "content",
      value: metadata["description"],
    },
    {
      selector: 'meta[data-dynamic="og:title"]',
      attribute: "content",
      value: metadata["og:title"],
    },
    {
      selector: 'meta[data-dynamic="og:description"]',
      attribute: "content",
      value: metadata["og:description"],
    },
    {
      selector: 'meta[data-dynamic="og:image"]',
      attribute: "content",
      value: metadata["og:image"],
    },
    {
      selector: 'meta[data-dynamic="og:url"]',
      attribute: "content",
      value: metadata["canonical"],
    },
  ];

  dynamicMetaSelectors.forEach(({ selector, attribute, value }) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  });

  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.setAttribute("href", metadata["canonical"]);

  const pageElement = document.querySelector('[data-dynamic="page"]');
  if (pageElement) pageElement.innerHTML = mediaHtml;

  return document.toString();
};
