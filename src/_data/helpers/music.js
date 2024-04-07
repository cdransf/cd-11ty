import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist?.toLowerCase()] || artist

const sanitizeMediaString = (string) => string.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '').replace(/A©|Ã©/g, 'e');
const artistSanitizedKey = (artist) => `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
const albumSanitizedKey = (album) => `${sanitizeMediaString(album).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`

export const buildChart = (tracks, artists, albums, nowPlaying = {}) => {
  const artistsData = {}
  const albumsData = {}
  const tracksData = {}
  const objectToArraySorted = (inputObject) => Object.values(inputObject).sort((a, b) => b.plays - a.plays)

  tracks.forEach(track => {
    if (!tracksData[track['track']]) {
      tracksData[track['track']] = {
        artist: artistCapitalization(track['artist']),
        title: track['track'],
        plays: 1,
        type: 'track',
        url: (artists[artistSanitizedKey(track['artist'])]?.['mbid'] && artists[artistSanitizedKey(track['artist'])]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistSanitizedKey(track['artist'])]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
      }
    } else {
      tracksData[track['track']]['plays']++
    }

    if (!artistsData[artistCapitalization(track['artist'])]) {
      artistsData[artistCapitalization(track['artist'])] = {
        title: artistCapitalization(track['artist']),
        plays: 1,
        mbid: artists[artistSanitizedKey(track['artist'])]?.['mbid'] || '',
        url: (artists[artistSanitizedKey(track['artist'])]?.['mbid'] && artists[artistSanitizedKey(track['artist'])]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistSanitizedKey(track['artist'])]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
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
        artist: artistCapitalization(track['artist']),
        plays: 1,
        mbid: albums[albumSanitizedKey(track['album'])]?.['mbid'] || '',
        url: (albums[albumSanitizedKey(track['album'])]?.['mbid'] && albums[albumSanitizedKey(track['album'])]?.['mbid'] !== '') ? `https://musicbrainz.org/release-group/${albums[albumSanitizedKey(track['album'])]?.['mbid']}` : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['artist'].replace(/\s+/g, '+')}&tag-lookup.release=${track['album'].replace(/\s+/g, '+')}`,
        image: albums[albumSanitizedKey(track['album'])]?.['image'] || `https://cdn.coryd.dev/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg`,
        type: 'album'
      }
    } else {
      albumsData[track['album']]['plays']++
    }
  })

  const topTracks = objectToArraySorted(tracksData).splice(0, 10)
  const topTracksData = {
    data: topTracks,
    mostPlayed: Math.max(...topTracks.map(track => track.plays))
  }

  return {
    artists: objectToArraySorted(artistsData),
    albums: objectToArraySorted(albumsData),
    tracks: objectToArraySorted(tracksData),
    topTracks: topTracksData,
    nowPlaying
  }
}

export const buildTracksWithArt = (tracks, artists, albums) => {
  tracks.forEach(track => {
    track['image'] = albums[albumSanitizedKey(track['album'])]?.['image'] || `https://cdn.coryd.dev/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg`
    track['url'] = (artists[artistSanitizedKey(track['artist'])]?.['mbid'] && artists[artistSanitizedKey(track['artist'])]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistSanitizedKey(track['artist'])]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`
  })
  return tracks
}