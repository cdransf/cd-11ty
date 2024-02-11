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

  if (process.env.ELEVENTY_PRODUCTION) {
    return await generateImage();
  } else {
    return await generatePlaceholder();
  }
};
