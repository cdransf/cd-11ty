---
date: '2023-06-07'
title: 'Optimizing for performance with Eleventy'
description: "In the interest of over-engineering my personal site I've gone out of my way to optimize it for performance."
tags: ['Eleventy', 'development']
image: https://cdn.coryd.dev/blog/page-speed.jpg
---

In the interest of over-engineering my personal site I've gone out of my way to optimize it for performance. It started out fairly quick as it's static, built using [Eleventy](https://www.11ty.dev) and is hosted with Vercel but, beyond the basic setup, I've taken some additional measures to drive the [pagespeed](https://pagespeed.web.dev) scores to `100` across the board.<!-- excerpt -->

## Limit client side JavaScript

I use a minimal amount of client-side JavaScript for behavior on my site, namely these blocks from my `base.liquid` template:

```javascript
const isDarkMode = () => localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (isDarkMode()) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}
...
document.getElementById("toggleDarkMode").addEventListener("click", function() {
  if (isDarkMode()) {
    localStorage.theme = 'light'
    document.documentElement.classList.remove('dark')
  } else {
    localStorage.theme = 'dark'
    document.documentElement.classList.add('dark')
  }
});
(function() {
  const pagination = document.getElementById('pagination');
  if (pagination) {
    pagination.addEventListener('change', (event) => {
      const page = parseInt(event.target.value)
      if (page === 1) {
        window.location.href = '/'
      } else {
        window.location.href = `/${
          event.target.value - 1
        }/`
      }
    })
  }
})()
```

These blocks allow the dark theme to be set based on the user's system preferences or at their discretion, using a button in the navigation. Additionally, the final function enables navigating between pages quickly using the `select` at the bottom of each blog listing page.

Everything is in line and concise without external script references. The lone external script is used for [Vercel's privacy friendly analytics](https://vercel.com/analytics).

## Inline and minify CSS

I use [Tailwind](https://tailwindcss.com) for CSS styles[^1] which is minified at build time:

```bash
ELEVENTY_PRODUCTION=true eleventy && NODE_ENV=production npx tailwindcss -i ./tailwind.css -c ./tailwind.config.js -o _site/assets/styles/tailwind.css --minify
```

The site include's Prism for code syntax highlighting and this is embedded and minified in the `<head>` of each page at build time:
{% raw %}

```liquid
{% capture css %}
  {% include "../assets/styles/prism.css" %}
{% endcapture %}
<style>
  {{ css | cssmin }}
</style>
```

{% endraw %}
This is made possible by leveraging CleanCSS in (you guessed it) `.eleventy.js`:
{% raw %}

```javascript
const CleanCSS = require('clean-css')
...
// css filters
eleventyConfig.addFilter('cssmin', (code) => new CleanCSS({}).minify(code).styles)
```

{% endraw %}

## Minify HTML output

Final HTML output for the site is minified when it's built using `@sherby/eleventy-plugin-files-minifier` which, [per the docs](https://www.npmjs.com/package/@sherby/eleventy-plugin-files-minifier):

> This plugin allow you to automatically **minify** files when building with **[Eleventy](https://www.11ty.dev/)**. It currently supports `css`, `html`, `json`, `xml`, `xsl` and `webmanifest` files.

Implementing this in `.eleventy.js` is straightforward:

```javascript
const pluginFilesMinifier = require('@sherby/eleventy-plugin-files-minifier')
...
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginFilesMinifier)
  ...
}
```

## Optimize images

Finally (and this is something that took me longer than it should have to do), we optimize images at build time using `@11ty/eleventy-image`, defining a shortcode in `.eleventy.js` as follows:
{% raw %}

```javascript
// image shortcode
eleventyConfig.addShortcode('image', async function (src, alt, css, sizes, loading) {
  let metadata = await Image(src, {
    widths: [75, 150, 300, 600],
    formats: ['webp'],
    urlPath: '/assets/img/cache/',
    outputDir: './_site/assets/img/cache/',
  })

  let imageAttributes = {
    class: css,
    alt,
    sizes,
    loading: loading || 'lazy',
    decoding: 'async',
  }

  return Image.generateHTML(metadata, imageAttributes)
})
```

{% endraw %}
This is most impactful on [my now page](https://coryd.dev/now) which is populated with quite a few images and, when used, looks something like this:
{% raw %}

```liquid
{% image artistImg, artistName, 'rounded-lg' %}
```

{% endraw %}
For this page in particular, the images that are rendered above the fold are set to load as `eager` to mitigate performance impacts related to [too much lazy loading](https://web.dev/lcp-lazy-loading/). These images are fetched from caches hosted at <a class="plausible-event-name=bunny+referral" href="https://bunny.net?ref=revw3mehej">Bunny.net</a> when the site is built.

All of these boilerplate steps leave us with a quick to load, accessible and resilient site:

{% image 'https://cdn.coryd.dev/blog/page-speed.jpg', 'Pagespeed scores for coryd.dev/now', 'image__banner' %}

[^1]: It's easy, flexible and helps mitigate my lack of an eye for design by providing safe baselines.
