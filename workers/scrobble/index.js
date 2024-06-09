import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import slugify from 'slugify';

const sanitizeMediaString = (str) => {
  const sanitizedString = str.normalize('NFD').replace(/[\u0300-\u036f\u2010\-\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '');
  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  });
};

export default {
  async fetch(request, env) {
    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_KEY = env.SUPABASE_KEY;
    const ACCOUNT_ID_PLEX = env.ACCOUNT_ID_PLEX;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const url = new URL(request.url);
    const params = url.searchParams;
    const id = params.get('id');

    if (!id) {
      return new Response(JSON.stringify({ status: 'Bad request' }), { headers: { "Content-Type": "application/json" } });
    }
    if (id !== ACCOUNT_ID_PLEX) {
      return new Response(JSON.stringify({ status: 'Forbidden' }), { headers: { "Content-Type": "application/json" } });
    }

    const contentType = request.headers.get("Content-Type") || '';
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ status: 'Bad request', message: 'Invalid Content-Type. Expected multipart/form-data.' }), { headers: { "Content-Type": "application/json" } });
    }

    try {
      const data = await request.formData();
      const payload = JSON.parse(data.get('payload'));

      if (payload?.event === 'media.scrobble') {
        const artist = payload['Metadata']['grandparentTitle'];
        const album = payload['Metadata']['parentTitle'];
        const track = payload['Metadata']['title'];
        const listenedAt = Math.floor(DateTime.now().toSeconds());
        const artistKey = sanitizeMediaString(artist);
        const albumKey = `${artistKey}-${sanitizeMediaString(album)}`;

        let { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .ilike('name_string', artist)
          .single();

        if (artistError && artistError.code === 'PGRST116') {
          const { error: insertArtistError } = await supabase.from('artists').insert([
            {
              mbid: null,
              image: `/artists/${artistKey}.jpg`,
              key: artistKey,
              name: artist,
              tentative: true
            }
          ]);

          if (insertArtistError) {
            return new Response(JSON.stringify({ status: 'error', message: insertArtistError.message }), { headers: { "Content-Type": "application/json" } });
          }

          ({ data: artistData, error: artistError } = await supabase
            .from('artists')
            .select('*')
            .ilike('name_string', artist)
            .single());
        } else if (artistError) {
          return new Response(JSON.stringify({ status: 'error', message: artistError.message }), { headers: { "Content-Type": "application/json" } });
        }

        let { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .ilike('key', albumKey)
          .single();

        if (albumError && albumError.code === 'PGRST116') {
          const { error: insertAlbumError } = await supabase.from('albums').insert([
            {
              mbid: null,
              image: `/albums/${albumKey}.jpg`,
              key: albumKey,
              name: album,
              tentative: true
            }
          ]);

          if (insertAlbumError) {
            return new Response(JSON.stringify({ status: 'error', message: insertAlbumError.message }), { headers: { "Content-Type": "application/json" } });
          }

          ({ data: albumData, error: albumError } = await supabase
            .from('albums')
            .select('*')
            .ilike('key', albumKey)
            .single());
        } else if (albumError) {
          return new Response(JSON.stringify({ status: 'error', message: albumError.message }), { headers: { "Content-Type": "application/json" } });
        }

        const { error: listenError } = await supabase.from('listens').insert([
          {
            artist_name: artistData.name_string,
            album_name: albumData.name,
            track_name: track,
            listened_at: listenedAt,
            album_key: albumKey
          }
        ]);

        if (listenError) {
          return new Response(JSON.stringify({ status: 'error', message: listenError.message }), { headers: { "Content-Type": "application/json" } });
        }
      }

      return new Response(JSON.stringify({ status: 'success' }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ status: 'error', message: e.message }), { headers: { "Content-Type": "application/json" } });
    }
  }
};