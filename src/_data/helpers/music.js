import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';
import mbidPatches from '../json/mbid-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist?.toLowerCase()] || artist

export const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010]/g, '-')
    .replace(/—/g, '-')
    .replace(/\.{3}/g, '')
    .replace(/\?/g, '')
    .replace(/[\(\)\[\]\{\}]/g, '')
}

export const mbidMap = (artist) => mbidPatches[artist.toLowerCase()] || ''

export const buildChart = (tracks, artists, albums) => {
  const artistsData = {}
  const albumsData = {}
  const tracksData = {}
  const artistSanitizedKey = (artist) => `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
  const albumSanitizedKey = (album) => `${sanitizeMediaString(album).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`
  const objectToArraySorted = (inputObject) => Object.values(inputObject).sort((a, b) => b.plays - a.plays)

  tracks.forEach(track => {
    if (!tracksData[track['track']]) {
      tracksData[track['track']] = {
        title: track['track'],
        plays: 1,
        type: 'track'
      }
    } else {
      tracksData[track['track']]['plays']++
    }

    if (!artistsData[artistCapitalization(track['artist'])]) {
      artistsData[artistCapitalization(track['artist'])] = {
        title: artistCapitalization(track['artist']),
        plays: 1,
        mbid: artists[artistSanitizedKey(track['artist'])]?.['mbid'] || '',
        url: artists[artistSanitizedKey(track['artist'])]?.['url'] || `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
        image: artists[artistSanitizedKey(track['artist'])]?.['image'] || `https://cdn.coryd.dev/artists/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}.jpg`,
        type: 'artist'
      }
    } else {
      artistsData[artistCapitalization(track['artist'])]['plays']++
    }

    if (!albumsData[track['album']]) {
      albumsData[track['album']] = {
        title: track['album'],
        artist: track['artist'],
        plays: 1,
        mbid: albums[albumSanitizedKey(track['album'])]?.['mbid'] || '',
        url: albums[albumSanitizedKey(track['album'])]?.['url'] || `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['artist'].replace(/\s+/g, '+')}&tag-lookup.release=${track['album'].replace(/\s+/g, '+')}`,
        image: albums[albumSanitizedKey(track['album'])]?.['image'] || `https://cdn.coryd.dev/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg`,
        type: 'album'
      }
    } else {
      albumsData[track['album']]['plays']++
    }
  })

  return {
    artists: objectToArraySorted(artistsData),
    albums: objectToArraySorted(albumsData),
    tracks: objectToArraySorted(tracksData),
  }
}