import EleventyFetch from '@11ty/eleventy-fetch';
import mbidPatches from './json/mbid-patches.js';

const mbidMap = (artist) => {
  return mbidPatches[artist.toLowerCase()] || '';
};

const removeAccents = (inputStr) => {
  const normalizedStr = inputStr.normalize('NFD');
  return normalizedStr.replace(/[\u0300-\u036f]/g, '');
};

export default async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM;
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=coryd_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`;
  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch();
  const data = await res;
  return data['topartists']['artist'].map((artist) => {
    let mbid = artist['mbid'];

    // mbid mismatches
    if (mbidMap(artist['name']) !== '') mbid = mbidMap(artist['name']);

    return {
      title: artist['name'],
      plays: artist['playcount'],
      rank: artist['@attr']['rank'],
      image: `https://cdn.coryd.dev/artists/${removeAccents(artist['name'])
        .replace(/\s+/g, '-')
        .toLowerCase()}.jpg`,
      url: mbid
        ? `https://musicbrainz.org/artist/${mbid}`
        : `https://musicbrainz.org/search?query=${artist['name'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
      type: 'artist',
    };
  });
}
