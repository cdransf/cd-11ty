---
date: '2024-02-05'
title: 'Check if images are available before optimizing in Eleventy'
description: 'How to check if a remote image is available before attempting to optimize it using @11ty/eleventy-img.'
tags: ['development', 'javascript', 'Eleventy']
---
I updated my image shortcode recently to leverage [Lene Saile](https://www.lenesaile.com)'s shortcode in the ever-useful [eleventy-excellent](https://github.com/madrilene/eleventy-excellent) project. As part of making this change, I also wanted to address build issues I had been facing when attempting to fetch and display avatars in webmentions (in the interest of improving post page performance).<!-- excerpt -->

When fetching webmention avatars I would see occasional issues where one would be unavailable and cause the build to fail when it encountered a response other than `200`. To work around this, I created a simple message to check the headers for remote images before attempting to optimize them, which looks like this:

```javascript
const imageExists = async () => {
  try {
    return await fetch(src, { method: 'HEAD' }).then((res) => res.ok);
  } catch {
    return false;
  }
};
```

This returns a simple `boolean` that can be checked before calling `Image` from `@11ty/eleventy-img`. Additionally, we don't want to fetch locally stored images and, as such, we check whether an image `isLocal` before calling `imageExists`:

```javascript
const isLocal = src.includes('src/assets');
```

The full code is below, but the actual image is returned out of this fun, fun nested ternary:

```javascript
return isLocal ? await generateImage() : await imageExists().then(async (exists) => (exists ? await generateImage() : await generatePlaceholder()));
```

If an image is local, `generateImage()`, otherwise check if the `imageExists()` then either `generateImage()` or `generatePlaceholder()`. The placeholder, in my case, is a div with a black background an an `svg` captured and passed into the `image` shortcode for cases where I expect some failures (remote images outside of the CDN I use, mostly).

```javascript
import Image from '@11ty/eleventy-img';
import path from 'path';
import htmlmin from 'html-minifier-terser';

const stringifyAttributes = (attributeMap) =>
  Object.entries(attributeMap)
    .map(([attribute, value]) => (value === undefined ? '' : `${attribute}="${value}"`))
    .join(' ');

export const img = async (
  src,
  alt = '',
  className,
  loading = 'lazy',
  shape = '',
  icon,
  maxWidth = 1248,
  sizes = '90vw',
  formats = ['avif', 'webp', 'jpeg']
) => {
  const isLocal = src.includes('src/assets');
  const imageExists = async () => {
    try {
      return await fetch(src, { method: 'HEAD' }).then((res) => res.ok);
    } catch {
      return false;
    }
  };

  const generateImage = async () => {
    const widths = [320, 570, 880, 1024, 1248];
    const metadata = await Image(src, {
      widths: widths.filter((width) => width <= maxWidth),
      formats: [...formats],
      outputDir: './_site/assets/img/cache/',
      urlPath: '/assets/img/cache/',
      filenameFormat: (id, src, width, format) => {
        const { name } = path.parse(src);
        return `${name}-${width}w.${format}`;
      },
    });
    const lowsrc = metadata.jpeg[metadata.jpeg.length - 1];
    const imageSources = Object.values(metadata)
      .map(
        (imageFormat) =>
          `<source type="${imageFormat[0].sourceType}" srcset="${imageFormat
            .map((entry) => entry.srcset)
            .join(', ')}" sizes="${sizes}">`
      )
      .join('\n');
    const imgageAttributes = stringifyAttributes({
      src: lowsrc.url,
      width: lowsrc.width,
      height: lowsrc.height,
      alt,
      class: className,
      loading,
      decoding: 'async',
    });
    const imageElement = `<picture>${imageSources}<img ${imgageAttributes} /></picture>`;

    return htmlmin.minify(imageElement, { collapseWhitespace: true });
  };

  const generatePlaceholder = async () => {
    return htmlmin.minify(
      `<div class="flex--centered image__placeholder ${shape}">${icon}</div>`,
      { collapseWhitespace: true }
    );
  };

  return isLocal ? await generateImage() : await imageExists().then(async (exists) => (exists ? await generateImage() : await generatePlaceholder()));
};
```

Here's an example use case from my `interaction.liquid` partial used in my webmentions implementation:

{% raw %}
```liquid
{% capture authorAlt %}{{ mention.author.name | escape }}{% endcapture %}
{% capture fallbackIcon %}{% tablericon "user" authorAlt %}{% endcapture %}
{% image mention.author.photo, authorAlt, 'avatar__image', 'lazy', 'square', fallbackIcon %}
```
{% endraw %}

With all that in place I can now build my site, check if an image exists and spit out a servicable placeholder without failing the build.