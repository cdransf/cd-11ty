export const fetchDataByUrl = async (supabase, table, url) => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("url", url)
    .single();

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    return null;
  }

  return data;
};

export const fetchGlobals = async (supabase) => {
  const { data, error } = await supabase
    .from("optimized_globals")
    .select("*")
    .single();
  if (error) {
    console.error("Error fetching globals:", error);
    return {};
  }
  return data;
};
