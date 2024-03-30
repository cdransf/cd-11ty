import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';
import mbidPatches from '../json/mbid-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist?.toLowerCase()] || artist

export const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010]/g, '-')
    .replace(/\.{3}/g, '')
    .replace(/\?/g, '')
    .replace(/[\(\)\[\]\{\}]/g, '')
}

export const mbidMap = (artist) => mbidPatches[artist.toLowerCase()] || ''

export const buildChart = (tracks) => {
  const artistsData = {}
  const albumsData = {}
  const tracksData = {}

  const objectToArraySorted = (inputObject) => {
    return Object.keys(inputObject).map(key => ({
      name: key,
      count: inputObject[key]
    })).sort((a, b) => b.count - a.count);
  };

  tracks.forEach(track => {
    if (!tracksData[track['track']]) {
      tracksData[track['track']] = 1
    } else {
      tracksData[track['track']]++
    }

    if (!artistsData[artistCapitalization(track['artist'])]) {
      artistsData[artistCapitalization(track['artist'])] = 1
    } else {
      artistsData[artistCapitalization(track['artist'])]++
    }

    if (!albumsData[track['album']]) {
      albumsData[track['album']] = 1
    } else {
      albumsData[track['album']]++
    }
  })

  return {
    artists: objectToArraySorted(artistsData),
    albums: objectToArraySorted(albumsData),
    tracks: objectToArraySorted(tracksData),
  }
}