import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request, env) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const rawTypes = searchParams.getAll("type") || [];
    const types = rawTypes.length > 0 ? rawTypes[0].split(",") : null;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const offset = (page - 1) * pageSize;

    try {
      const { data, error } = await supabase.rpc("search_optimized_index", {
        search_query: query,
        page_size: pageSize,
        page_offset: offset,
        types: types.length ? types : null,
      });

      if (error) {
        console.error("Error fetching search data:", error);
        return new Response(JSON.stringify({ results: [] }), { status: 500 });
      }

      return new Response(JSON.stringify({ results: data }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
