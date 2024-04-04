import fs from 'fs'

export default async function () {
  let window;
  fs.readFileSync('./src/_data/json/scrobbles-window.json', (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    window = JSON.parse(data)
  console.log(window)
  })
  return window

  // fs.readdir('./src/_data/json/', (err, files) => {
  //   files.forEach(file => {
  //     console.log(file);
  //   });
  // });
}
