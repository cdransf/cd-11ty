import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const emojiMap = (genre, artist) => {
  const DEFAULT = "🎧"
  const normalizedArtist = artist?.toLowerCase()
  if (normalizedArtist === "afi") return "⛵️🌅"
  if (normalizedArtist === "agalloch") return "🏔️"
  if (normalizedArtist === "american football") return "🏠"
  if (normalizedArtist === "augury") return "☄️"
  if (normalizedArtist === "autopsy") return "🧟"
  if (normalizedArtist === "balance and composure") return "🪂"
  if (normalizedArtist === "bedsore") return "🛏️"
  if (normalizedArtist === "birds in row") return "🦅🦉🦢"
  if (normalizedArtist === "black flag") return "🏴"
  if (normalizedArtist === "blink-182") return "😵"
  if (normalizedArtist === "blood incantation") return "👽"
  if (normalizedArtist === "bolt thrower") return "⚔️"
  if (normalizedArtist === "bruce springsteen") return "🇺🇸"
  if (normalizedArtist === "carcass") return "🥼"
  if (normalizedArtist === "cloud rat") return "☁️🐀"
  if (normalizedArtist === "counting crows") return "🐦‍⬛"
  if (normalizedArtist === "david bowie") return "👨🏻‍🎤"
  if (normalizedArtist === "devoid of thought") return "🚫💭"
  if (normalizedArtist === "deftones") return "🦉"
  if (normalizedArtist === "drug church") return "💊⛪️"
  if (normalizedArtist === "fleshwater") return "🐤"
  if (normalizedArtist === "full of hell & nothing") return "🫨🎸"
  if (normalizedArtist === "imperial triumphant") return "🎭"
  if (normalizedArtist === "mastodon") return "🐋"
  if (normalizedArtist === "mineral") return "🪨"
  if (normalizedArtist === "minor threat") return "👨🏻‍🦲"
  if (normalizedArtist === "nomeansno") return "🐵🐮🚬"
  if (normalizedArtist === "nothing") return "🏳️"
  if (normalizedArtist === "panopticon") return "🪕🪦"
  if (normalizedArtist === "plunger") return "🪠"
  if (normalizedArtist === "radiohead") return "📻"
  if (normalizedArtist === "soccer mommy") return "⚽️"
  if (normalizedArtist === "taylor swift") return "👸🏼"
  if (normalizedArtist === "the mars volta") return "💡😮"
  if (normalizedArtist === "thrice") return "👨‍🎨🚑"
  if (normalizedArtist === "tom waits") return "🤹🏻"
  if (normalizedArtist === "webbed wing") return "🤡"

  // early return for bad input
  if (!genre) return DEFAULT

  if (genre.includes("death metal") || genre.includes("death-doom")) return "💀"
  if (genre.includes("black metal") || genre.includes("blackgaze")) return "🪦"
  if (genre.includes("metal")) return "🤘"
  if (genre.includes("emo") || genre.includes("blues")) return "😢"
  if (genre.includes("grind") || genre.includes("powerviolence")) return "🫨"
  if (
    genre.includes("country") ||
    genre.includes("americana") ||
    genre.includes("bluegrass") ||
    genre.includes("folk") ||
    genre.includes("songwriter")
  )
    return "🪕"
  if (genre.includes("post-punk")) return "😔"
  if (genre.includes("dance-punk")) return "🪩"
  if (genre.includes("punk") || genre.includes("hardcore")) return "✊"
  if (genre.includes("hip hop")) return "🎤"
  if (genre.includes("hip-hop")) return "🎤"
  if (genre.includes("progressive") || genre.includes("experimental"))
    return "🤓"
  if (genre.includes("jazz")) return "🎺"
  if (genre.includes("psychedelic")) return "💊"
  if (genre.includes("dance") || genre.includes("electronic")) return "💻"
  if (genre.includes("ambient")) return "🤫"
  if (
    genre.includes("alternative") ||
    genre.includes("rock") ||
    genre.includes("shoegaze") ||
    genre.includes("screamo") ||
    genre.includes("grunge")
  )
    return "🎸"
  return DEFAULT
}

export default async () => {
  const { data, error } = await supabase
    .from('listens')
    .select(`
      track_name,
      artist_name,
      listened_at,
      artists (mbid, genre)
    `)
    .order('listened_at', { ascending: false })
    .range(0, 1)

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

  const scrobbleData = data[0]

  return new Response(JSON.stringify({
    content: `${emojiMap(
      scrobbleData.artists.genre,
      scrobbleData.artist_name
    )} ${scrobbleData.track_name} by <a href="http://musicbrainz.org/artist/${scrobbleData.artists.mbid}">${
      scrobbleData.artist_name
    }</a>`,
  }), { headers });
};

export const config = {
  cache: "manual",
  path: "/api/now-playing"
};