import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchGlobals = async () => {
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

export default async function () {
  try {
    return await fetchGlobals();
  } catch (error) {
    console.error("Error fetching and processing globals:", error);
    return {};
  }
}
