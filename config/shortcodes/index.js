import Image from '@11ty/eleventy-img'
import path from 'path'
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
  maxWidth = 1248,
  sizes = '90vw',
  formats = ['avif', 'webp', 'jpeg']
) => {
  const widths = [200, 320, 570, 880, 1024, 1248].filter(width => width <= maxWidth);
  const metadata = await Image(src, {
    widths: [...widths],
    formats: [...formats],
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/',
    filenameFormat: (id, src, width, format, options) => {
      const extension = path.extname(src);
      const name = path.basename(src, extension);
      return `${encodeURIComponent(name)}-${width}w.${format}`;
    },
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