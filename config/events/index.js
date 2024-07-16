import fs from 'fs'
import path from 'path'
import { minify } from 'terser'

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

export const copy404Page = () => {
  const sourcePath = path.join('_site', '404', 'index.html')
  const destinationPath = path.join('_site', '404.html')

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) console.error('Error copying 404 page:', err)
  })
}