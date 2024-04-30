import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist?.toLowerCase()] || artist

const sanitizeMediaString = (string) => string.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')
const artistSanitizedKey = (artist) => `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}`
const albumSanitizedKey = (artist, album) => `${sanitizeMediaString(artist).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(album.replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}`

export const buildChart = (tracks, artists, albums, nowPlaying = {}) => {
  const artistsData = {}
  const albumsData = {}
  const tracksData = {}
  const objectToArraySorted = (inputObject) => Object.values(inputObject).sort((a, b) => b.plays - a.plays)

  tracks.forEach(track => {
    if (!tracksData[track['track']]) {
      const artistKey = artistSanitizedKey(track['artist'])

      tracksData[track['track']] = {
        artist: artistCapitalization(track['artist']),
        title: track['track'],
        plays: 1,
        type: 'track',
        url: (artists[artistKey]?.['mbid'] && artists[artistKey]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistKey]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
      }
    } else {
      tracksData[track['track']]['plays']++
    }

    if (!artistsData[artistCapitalization(track['artist'])]) {
      const artistKey = artistSanitizedKey(track['artist'])

      artistsData[artistCapitalization(track['artist'])] = {
        title: artistCapitalization(track['artist']),
        plays: 1,
        mbid: artists[artistKey]?.['mbid'] || '',
        url: (artists[artistKey]?.['mbid'] && artists[artistKey]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistKey]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`,
        image: artists[artistSanitizedKey(track['artist'])]?.['image'] || `https://coryd.dev/.netlify/images/?url=/media/artists/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}.jpg&fit=cover&w=320&h=320`,
        type: 'artist'
      }
    } else {
      artistsData[artistCapitalization(track['artist'])]['plays']++
    }

    if (!albumsData[track['album']]) {
      const albumKey = albumSanitizedKey(artistCapitalization(track['artist']), track['album'])

      albumsData[track['album']] = {
        title: track['album'],
        artist: artistCapitalization(track['artist']),
        plays: 1,
        mbid: albums[albumKey]?.['mbid'] || '',
        url: (albums[albumKey]?.['mbid'] && albums[albumSanitizedKey(artistCapitalization(track['artist']), track['artist'], track['album'])]?.['mbid'] !== '') ? `https://musicbrainz.org/release/${albums[albumKey]?.['mbid']}` : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${track['artist'].replace(/\s+/g, '+')}&tag-lookup.release=${track['album'].replace(/\s+/g, '+')}`,
        image: albums[albumKey]?.['image'] || `https://coryd.dev/.netlify/images/?url=/media/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg&fit=cover&w=320&h=320`,
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
    track['image'] = albums[albumSanitizedKey(artistCapitalization(track['artist']), track['album'])]?.['image'] || `https://coryd.dev/.netlify/images/?url=/media/albums/${sanitizeMediaString(track['artist']).replace(/\s+/g, '-').toLowerCase()}-${sanitizeMediaString(track['album'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase())}.jpg&fit=cover&w=320&h=320`
    track['url'] = (artists[artistSanitizedKey(track['artist'])]?.['mbid'] && artists[artistSanitizedKey(track['artist'])]?.['mbid'] !== '') ? `http://musicbrainz.org/artist/${artists[artistSanitizedKey(track['artist'])]?.['mbid']}` : `https://musicbrainz.org/search?query=${track['artist'].replace(
            /\s+/g,
            '+'
          )}&type=artist`
  })
  return tracks
}