import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist] || artist