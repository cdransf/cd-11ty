import EleventyFetch from '@11ty/eleventy-fetch';
import { buildChart } from './helpers/music.js'

export default async function () {
  const API_KEY_MUSIC = process.env.API_KEY_MUSIC;
  const url = `https://coryd.dev/api/music?key=${API_KEY_MUSIC}`;
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch();
  const resObj = await res;
  return buildChart(resObj['scrobbles'], resObj['artists'], resObj['albums'])
}
