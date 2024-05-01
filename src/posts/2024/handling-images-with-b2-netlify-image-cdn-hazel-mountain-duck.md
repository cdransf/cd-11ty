---
date: '2024-05-01T09:00-08:00'
title: "Handling images with B2, Netlify's image CDN, Hazel and Mountain Duck"
description: "I've spent a while hosting and fetching images from bunny.net when my 11ty builds. I had multiple pull zones configured and wanted to leverage bunny.net's transforms, but the pricing of $15/month per zone wasn't feasible."
tags: ['development', 'javascript', 'netlify', 'backblaze', 'macOS']
---
I've spent a while hosting and fetching images from bunny.net when my [11ty](https://www.11ty.dev/) builds. I had multiple pull zones configured and wanted to leverage bunny.net's transforms, but the pricing of $15/month per zone wasn't feasible.<!-- excerpt -->

My site is hosted on Netlify and they've had an image CDN in beta for a bit and [recently made it publicly available](https://www.netlify.com/blog/netlify-image-cdn-seamlessly-resize-crop-and-deliver-optimized-media-globally/). Rather than route requests to bunny.net through yet another CDN, I decided to drop my images into a B2 bucket over at Backblaze. I already use B2 for backups, raw storage and a few other things, so this was also an opportunity to consolidate some storage.

I upload new images to my site fairly regularly for display on [my now page](https://coryd.dev/now) (and a few other pages) — [the bulk of the images are artists and albums I use to build charts of my listening habits](https://coryd.dev/posts/2024/building-a-scrobbler-using-plex-webhooks-edge-functions-and-blob-storage/).

To simplify file uploads to B2, I mount the bucket for my site using [Mountain Duck](https://mountainduck.io/). This allows me to access, rename and update images quickly through Finder. It also allows me to automate image naming and uploading using [Hazel](https://www.noodlesoft.com/).

My music charting feature relies on JSON maps of artist and album metadata — if a new artist or album isn't present in either, it assumes that the image it needs is in the format of `artist-name.jpg` or `artist-name-album-name.jpg`. I store the canonical copies of these image files in a separate GitHub repo and have Hazel watch the `artist` and `album` directories contained therein. It renames the files to match the aforementioned format, strips characters that typically break URLs and copies them to my mounted B2 Bucket.

{% image 'https://coryd.dev/.netlify/images/?url=/media/blog/albums-hazel-rule-example.png&w=1000', 'An example of my album art Hazel workflow', 'image-banner' %}

---

Within the Netlify `_redirects` file for my site I have the following rule set:

```text
# media
/media/* https://f001.backblazeb2.com/file/coryd-dev-images/:splat 200
```

I have the bucket in my source as it *is* public but the actual directories don't list their contents. Rewriting the URL to `/media/` keeps image references a bit tidier.

You'll also need to set an array of allowed domains that you intend to source images from in your `netlify.toml`:

```toml
###
# IMAGES
###
[images]
  remote_images = ["https://f001.backblazeb2.com/file/coryd-dev-images/.*", "https://image.tmdb.org/.*", "https://books.google.com/.*"]
```

I'm primarily leveraging my B2 bucket, but also use the [The Movie Database](https://www.themoviedb.org/) for TV/movie posters displayed on my now page and fetch book covers from Google books.

When I access an image, it's then done via [Netlify's image CDN](https://docs.netlify.com/image-cdn/overview/), allowing me to set optimal dimensions, fit and format: `https://coryd.dev/.netlify/images/?url=/media/albums/IMAGE.jpg&fit=cover&w=320&h=320`. I apply similar parameters to book and TV/movie images to preserve a consistent aspect ratio, without coercing these images into a consistent shape with CSS[^1].

Once I have my Netlify CDN URLs, I *still* process them via an 11ty image shortcode:

```javascript
import Image from '@11ty/eleventy-img'
import htmlmin from 'html-minifier-terser'

const stringifyAttributes = (attributeMap) => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};

export const img = async (
  src,
  alt = '',
  className,
  loading = 'lazy',
  sizes = '90vw',
  formats = ['avif', 'webp', 'jpg', 'jpeg']
) => {
  const widths = [80, 200, 320, 570, 880, 1024, 1248];
  const metadata = await Image(src, {
    widths: [...widths],
    formats: [...formats],
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/'
  });

  const lowsrc = metadata.jpeg[metadata.jpeg.length - 1];

  const imageSources = Object.values(metadata)
    .map((imageFormat) => {
      return `  <source type="${
        imageFormat[0].sourceType
      }" srcset="${imageFormat
        .map((entry) => entry.srcset)
        .join(', ')}" sizes="${sizes}">`;
    })
    .join('\n');

  const imageAttributes = stringifyAttributes({
    src: lowsrc.url,
    width: lowsrc.width,
    height: lowsrc.height,
    alt,
    class: className,
    loading,
    decoding: 'async',
  });

  const imageElement = `<picture>${imageSources}<img ${imageAttributes} /></picture>`;

  return htmlmin.minify(imageElement, { collapseWhitespace: true });
};
```

All of this yields automated image naming, easier uploading, properly sized, formatted and cropped images that are then used to generate `<picture>` and `<img … />` elements in the final markup.

[^1]: I could display them at the source aspect ratio, but I prefer the visual consistency this approach allows.