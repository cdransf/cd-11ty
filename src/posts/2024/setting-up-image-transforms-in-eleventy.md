---
date: '2024-02-14'
title: 'Setting up image transforms in Eleventy'
description: ''
tags: ['development', 'Eleventy', 'javascript']
---
Eleventy added a transform option to process images in Eleventy `v3.0.0-alpha.5` and `Image v4.0.1` so, naturally, I had to set it up on my site. If you don't want to read this post, you can check out [the full diff for the changes](https://github.com/cdransf/coryd.dev/commit/7e1597b36a07e9bd18c015c2bddd193e70799d6b).<!-- excerpt -->

The process was relatively straightforward:

1. I updated my `.eleventy.js` config:
   ```javascript
   // I'm using `esm` for my site, hence the import syntax
   import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'

   // this isn't necessary, but I'm using it to format the name of generated image files
   import path from 'path';
   ...
   eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['avif', 'webp', 'jpeg'], // I'm generating `avif` files, the docs include just `webp` and `jpeg`
    widths: [320, 570, 880, 1024, 1248], // I moved the explicit widths over from my old shortcode
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '90vw', // I set a default `sizes` attribute here — the plugin errored out without it and I didn't want to set it per image
    },
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/',
    filenameFormat: (id, src, width, format) => {
      const { name } = path.parse(src);
      return `${name}-${width}w.${format}`;
    },
   });
   ```
2. I went  through and updated every image on my site,  which largely consisted of moving source, alt and classes into `<img … />` declarations. You can also override default attributes inline, as I did in my `media-grid.liquid` template (as I want the first grid of images to be set to `eager` and everything else to `lazy`:
   {% raw %}
   ```liquid
   <img src="{{ item.image }}" alt="{{ alt }}" loading="{{ loadingStrategy }}" />
   ```
   {% endraw %}
3. I removed my old shortcode at `shortcodes/index.js` and removed references in `.eleventy.js`

And, there you have it — transformed image tags and no shortcode syntax.