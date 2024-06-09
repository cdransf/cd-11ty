import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

const sanitizeMediaString = (str) => {
  const sanitizedString = str.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '');

  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  });
};

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const getCountryName = (countryCode) => regionNames.of(countryCode.trim()) || countryCode.trim();
const parseCountryField = (countryField) => {
  if (!countryField) return null;

  const delimiters = [',', '/', '&', 'and'];
  let countries = [countryField];

  delimiters.forEach(delimiter => {
    countries = countries.flatMap(country => country.split(delimiter));
  });

  return countries.map(getCountryName).join(', ');
};

const fetchGenreById = async (supabase, genreId) => {
  const { data, error } = await supabase
    .from('genres')
    .select('emoji')
    .eq('id', genreId)
    .single();

  if (error) {
    console.error('Error fetching genre:', error);
    return null;
  }

  return data.emoji;
};

export default {
  async fetch(request, env) {
    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_KEY = env.SUPABASE_KEY;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase
      .from('listens')
      .select(`
        track_name,
        artist_name,
        listened_at,
        artists (mbid, genres, country, emoji)
      `)
      .order('listened_at', { ascending: false })
      .range(0, 1);

    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=360, stale-while-revalidate=1080",
    };

    if (error) {
      console.error('Error fetching data:', error);
      return new Response(JSON.stringify({ error: "Failed to fetch the latest track" }), { headers });
    }

    if (data.length === 0) {
      return new Response(JSON.stringify({ message: "No recent tracks found" }), { headers });
    }

    const scrobbleData = data[0];
    const genreEmoji = await fetchGenreById(supabase, scrobbleData.artists.genres);
    const emoji = scrobbleData.artists.emoji || genreEmoji;

    return new Response(JSON.stringify({
      content: `${emoji || '🎧'} ${scrobbleData.track_name} by <a href="https://coryd.dev/music/artists/${sanitizeMediaString(scrobbleData.artist_name)}-${sanitizeMediaString(parseCountryField(scrobbleData.artists.country))}">${
        scrobbleData.artist_name
      }</a>`,
    }), { headers });
  }
};