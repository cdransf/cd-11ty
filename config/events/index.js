import fs from 'fs'
import Image from '@11ty/eleventy-img'
import { minify } from 'terser'

export const svgToJpeg = () => {
  if (process.env.ELEVENTY_RUN_MODE !== 'build') {
    const socialPreviewImagesInputDir = '_site/assets/img/social-preview/'
    const socialPreviewImagesOutputDir = 'src/assets/img/social-preview/'
    fs.readdir(socialPreviewImagesInputDir, (err, files) => {
      if (!!files && files.length > 0) {
        files.forEach((fileName) => {
          if (fileName.endsWith('.svg')) {
            let imageUrl = socialPreviewImagesInputDir + fileName
            Image(imageUrl, {
              formats: ['jpeg'],
              outputDir: './' + socialPreviewImagesOutputDir,
              filenameFormat: function (id, src, width, format) {
                let outputFileName = fileName.substring(0, fileName.length - 4)
                return `${outputFileName}.${format}`
              },
            })
          }
        })
      } else {
        console.log('⚠ No social images found')
      }
    })
  }
}

export const minifyJsComponents = async () => {
  const jsComponentsDir = '_site/assets/scripts/components';
  const files = fs.readdirSync(jsComponentsDir);
  for (const fileName of files) {
    if (fileName.endsWith('.js')) {
      const filePath = `${jsComponentsDir}/${fileName}`;
      const minified = await minify(fs.readFileSync(filePath, 'utf8'));
      fs.writeFileSync(filePath, minified.code);
    } else {
      console.log('⚠ No js components found')
    }
  }
}
