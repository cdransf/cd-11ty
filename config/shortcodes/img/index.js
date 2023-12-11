const outdent = require('outdent')
const Image = require('@11ty/eleventy-img')

const img = async (
  src,
  alt,
  className = undefined,
  loading = 'lazy',
  widths = [75, 150, 300, 600, 900, 1200],
  formats = ['webp', 'jpeg'],
  sizes = '100vw'
) => {
  const imageMetadata = await Image(src, {
    widths: [...widths, null],
    formats: [...formats, null],
    outputDir: './_site/assets/img/cache/',
    urlPath: '/assets/img/cache/',
  })

  const stringifyAttributes = (attributeMap) => {
    return Object.entries(attributeMap)
      .map(([attribute, value]) => {
        if (typeof value === 'undefined') return ''
        return `${attribute}="${value}"`
      })
      .join(' ')
  }

  const sourceHtmlString = Object.values(imageMetadata)
    .map((images) => {
      const { sourceType } = images[0]
      const sourceAttributes = stringifyAttributes({
        type: sourceType,
        srcset: images.map((image) => image.srcset).join(', '),
        sizes,
      })

      return `<source ${sourceAttributes}>`
    })
    .join('\n')

  const getLargestImage = (format) => {
    const images = imageMetadata[format]
    return images[images.length - 1]
  }

  const largestUnoptimizedImg = getLargestImage(formats[0])
  const imgAttributes = stringifyAttributes({
    src: largestUnoptimizedImg.url,
    width: largestUnoptimizedImg.width,
    height: largestUnoptimizedImg.height,
    alt,
    loading,
    decoding: 'async',
  })

  const imgHtmlString = `<img ${imgAttributes}>`
  const pictureAttributes = stringifyAttributes({
    class: className,
  })

  const picture = `<picture ${pictureAttributes}>
    ${sourceHtmlString}
    ${imgHtmlString}
  </picture>`

  return outdent`${picture}`
}

module.exports = img
