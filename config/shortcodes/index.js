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