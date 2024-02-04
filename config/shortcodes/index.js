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
  shape = 'square',
  icon,
  maxWidth = 1248,
  sizes = '90vw',
  formats = ['avif', 'webp', 'jpeg']
) => {
  const isLocal = src.includes('src/assets');
  const imageExists = async () => {
    try {
      const isOk = await fetch(src, { method: 'HEAD' }).then((res) => res.ok);
      return isOk;
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
        const { ext, name } = path.parse(src);
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
    const placeholderElement = `<div class="flex--centered image__placeholder ${shape}">${icon}</div>`;
    return htmlmin.minify(placeholderElement, { collapseWhitespace: true });
  };

  return isLocal ? await generateImage() : await imageExists().then(async (exists) => (exists ? await generateImage() : await generatePlaceholder()));
};