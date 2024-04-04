import { readFile } from 'fs/promises'

export default async function () {
  let window = JSON.parse(await readFile('./src/_data/json/scrobbles-window.json', 'utf8'));
  console.log(window)
  return window
}
