import { createClient } from "@supabase/supabase-js";
import { fetchDataByUrl, fetchGlobals } from "./utils/fetchers.js";
import { minifyHTML } from "./utils/formatters.js";
import {
  generateArtistHTML,
  generateBookHTML,
  generateGenreHTML,
  generateMetadata,
  generateWatchingHTML,
} from "./utils/generators.js";
import { updateDynamicContent } from "./utils/updaters.js";

const BASE_URL = "https://coryd.dev";
const NOT_FOUND_URL = `${BASE_URL}/404`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_KEY || process.env.SUPABASE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    let data, type;

    if (path === "/books" || path === "/books/")
      return fetch(`${BASE_URL}/books/`);
    if (path.startsWith("/books/years/")) return fetch(`${BASE_URL}${path}`);

    if (path.startsWith("/watching/movies/")) {
      data = await fetchDataByUrl(supabase, "optimized_movies", path);
      type = "movie";
    } else if (path.startsWith("/watching/shows/")) {
      data = await fetchDataByUrl(supabase, "optimized_shows", path);
      type = "show";
    } else if (path.startsWith("/music/artists/")) {
      data = await fetchDataByUrl(supabase, "optimized_artists", path);
      type = "artist";
    } else if (path.startsWith("/music/genres/")) {
      data = await fetchDataByUrl(supabase, "optimized_genres", path);
      type = "genre";
    } else if (path.startsWith("/books/")) {
      data = await fetchDataByUrl(supabase, "optimized_books", path);
      type = "book";
    } else {
      return Response.redirect(NOT_FOUND_URL, 302);
    }

    if (!data) return Response.redirect(NOT_FOUND_URL, 302);

    const globals = await fetchGlobals(supabase);
    let mediaHtml;

    switch (type) {
      case "artist":
        mediaHtml = generateArtistHTML(data, globals);
        break;
      case "genre":
        mediaHtml = generateGenreHTML(data, globals);
        break;
      case "book":
        mediaHtml = generateBookHTML(data, globals);
        break;
      default:
        mediaHtml = generateWatchingHTML(data, globals, type);
        break;
    }

    const templateResponse = await fetch(`${BASE_URL}/dynamic`);
    const template = await templateResponse.text();
    const metadata = generateMetadata(data, type, globals);
    const html = minifyHTML(updateDynamicContent(template, metadata, mediaHtml));
    const headers = new Headers({
      "Content-Type": "text/html",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    });

    return new Response(html, { headers });
  },
};
