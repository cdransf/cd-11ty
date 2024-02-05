import Image from '@11ty/eleventy-img';
import path from 'path';
import Sharp from 'sharp';
import htmlmin from 'html-minifier-terser';

const stringifyAttributes = attributeMap =>
  Object.entries(attributeMap)
    .map(([attribute, value]) =>
      value === undefined
        ? ''
        : `${attribute}="${typeof value === 'object' ? value.value : value}"`
    )
    .join(' ');

const resizeImage = async (src, width, height, mode, shape) => {
  const commonOptions = {
    fit: mode,
    position: 'center',
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  };

  if (shape === 'square') {
    const buffer = await Sharp(src)
      .resize({
        width: Math.min(width, height),
        height: Math.min(width, height),
        ...commonOptions,
      })
      .toBuffer();

    return { buffer, width: Math.min(width, height), height: Math.min(width, height) };
  } else if (shape === 'vertical') {
    const aspectRatio = 2 / 3;
    const targetWidth = Math.min(Math.floor(height * aspectRatio), width);
    const buffer = await Sharp(src)
      .resize({
        width: targetWidth,
        height: Math.floor(targetWidth / aspectRatio),
        ...commonOptions,
      })
      .toBuffer();

    return { buffer, width: targetWidth, height: Math.floor(targetWidth / aspectRatio) };
  } else {
    const buffer = await Sharp(src).toBuffer();

    return { buffer, width, height };
  }
};

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
      return await fetch(src, { method: 'HEAD' }).then(res => res.ok);
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

    if (shape === 'square' || shape === 'vertical') {
      const { buffer, width: resizedWidth, height: resizedHeight } = await resizeImage(
        `./_site/${lowsrc.url}`,
        lowsrc.width,
        lowsrc.height,
        'cover',
        shape
      );
      const resizedImageBase64 = buffer.toString('base64');
      const resizedImageSrc = `data:image/${lowsrc.format};base64,${resizedImageBase64}`;
      const imageSources = Object.values(metadata)
        .map((imageFormat) =>
          `<source type="${imageFormat[0].sourceType}" srcset="${imageFormat
            .map((entry) => entry.srcset)
            .join(', ')}" sizes="${sizes}">`
        )
        .join('\n');
      const imageAttributes = stringifyAttributes({
        src: resizedImageSrc,
        width: resizedWidth,
        height: resizedHeight,
        alt,
        class: className,
        loading,
        decoding: 'async',
      });
      const imageElement = `<picture>${imageSources}<img ${imageAttributes} /></picture>`;

      return htmlmin.minify(imageElement, { collapseWhitespace: true });
    } else {
      const imageSources = Object.values(metadata)
        .map((imageFormat) =>
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
    }
  };

  const generatePlaceholder = async () => {
    const placeholderElement = `<div class="flex--centered image__placeholder ${shape}">${icon}</div>`;
    return htmlmin.minify(placeholderElement, { collapseWhitespace: true });
  };

  return isLocal ? await generateImage() : await imageExists().then(async exists => (exists ? await generateImage() : await generatePlaceholder()));
};