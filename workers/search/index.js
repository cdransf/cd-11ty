import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request, env) {
    const allowedOrigin = "https://coryd.dev";
    const origin = request.headers.get("Origin") || "";
    const referer = request.headers.get("Referer") || "";

    if (!origin.startsWith(allowedOrigin) && !referer.startsWith(allowedOrigin))
      return new Response("Forbidden", { status: 403 });

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const types = searchParams.get("type")?.split(",") || [];
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const offset = (page - 1) * pageSize;

    try {
      let supabaseQuery = supabase
        .from("optimized_search_index")
        .select(
          "id, title, description, url, tags, type, total_plays, genre_name, genre_url",
          { count: "exact" }
        )
        .range(offset, offset + pageSize - 1);

      if (types.length > 0) supabaseQuery = supabaseQuery.in("type", types);

      if (query) {
        const queryLower = `%${query.toLowerCase()}%`;
        supabaseQuery = supabaseQuery.or(
          `title.ilike.${queryLower},description.ilike.${queryLower}`
        );
      }

      const { data, error, count } = await supabaseQuery;

      if (error) {
        console.error("Query error:", error);
        return new Response(JSON.stringify({ error: "Error fetching data" }), {
          status: 500,
        });
      }

      if (!data || data.length === 0) {
        console.warn("No results found.");
        return new Response(
          JSON.stringify({ results: [], total: 0, page, pageSize }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          results: data,
          total: count || 0,
          page,
          pageSize,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  },
};
