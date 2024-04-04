import fs from 'fs'

export default async function () {
  // const window = fs.readFileSync('./json/scrobbles-window.json', (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   }
  //   return JSON.parse(data)
  // })
  // console.log(window)
  // return window

  fs.readdir('./json', (err, files) => {
    files.forEach(file => {
      console.log(file);
    });
  });
}
