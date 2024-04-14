import { getStore } from '@netlify/blobs'

const emojiMap = (genre, artist) => {
  const DEFAULT = "🎧";
  const normalizedArtist = artist?.toLowerCase();
  if (normalizedArtist === "afi") return "⛵️🌅";
  if (normalizedArtist === "agalloch") return "🏔️";
  if (normalizedArtist === "augury") return "☄️";
  if (normalizedArtist === "autopsy") return "🧟";
  if (normalizedArtist === "balance and composure") return "🪂";
  if (normalizedArtist === "bedsore") return "🛏️";
  if (normalizedArtist === "birds in row") return "🦅🦉🦢";
  if (normalizedArtist === "black flag") return "🏴";
  if (normalizedArtist === "blink-182") return "😵";
  if (normalizedArtist === "blood incantation") return "👽";
  if (normalizedArtist === "bolt thrower") return "⚔️"
  if (normalizedArtist === "bruce springsteen") return "🇺🇸";
  if (normalizedArtist === "carcass") return "🥼";
  if (normalizedArtist === "counting crows") return "🐦‍⬛";
  if (normalizedArtist === "david bowie") return "👨🏻‍🎤";
  if (normalizedArtist === "cevoid of thought") return "🚫💭";
  if (normalizedArtist === "drug church") return "💊⛪️";
  if (normalizedArtist === "fleshwater") return "🐤";
  if (normalizedArtist === "full of hell & nothing") return "🫨🎸";
  if (normalizedArtist === "imperial triumphant") return "🎭";
  if (normalizedArtist === "mastodon") return "🐋";
  if (normalizedArtist === "minor threat") return "👨🏻‍🦲";
  if (normalizedArtist === "nothing") return "🏳️";
  if (normalizedArtist === "panopticon") return "🪕🪦";
  if (normalizedArtist === "radiohead") return "📻";
  if (normalizedArtist === "taylor swift") return "👸🏼";
  if (normalizedArtist === "the mars volta") return "💡😮";
  if (normalizedArtist === "thrice") return "👨‍🎨🚑";
  if (normalizedArtist === "webbed wing") return "🤡";

  // early return for bad input
  if (!genre) return DEFAULT;

  if (genre.includes("death metal") || genre.includes("death-doom")) return "💀";
  if (genre.includes("black metal") || genre.includes("blackgaze")) return "🪦";
  if (genre.includes("metal")) return "🤘";
  if (genre.includes("emo") || genre.includes("blues")) return "😢";
  if (genre.includes("grind") || genre.includes("powerviolence")) return "🫨";
  if (
    genre.includes("country") ||
    genre.includes("americana") ||
    genre.includes("bluegrass") ||
    genre.includes("folk") ||
    genre.includes("songwriter")
  )
    return "🪕";
  if (genre.includes("post-punk")) return "😔";
  if (genre.includes("dance-punk")) return "🪩";
  if (genre.includes("punk") || genre.includes("hardcore")) return "✊";
  if (genre.includes("hip hop")) return "🎤";
  if (genre.includes("progressive") || genre.includes("experimental"))
    return "🤓";
  if (genre.includes("jazz")) return "🎺";
  if (genre.includes("psychedelic")) return "💊";
  if (genre.includes("dance") || genre.includes("electronic")) return "💻";
  if (genre.includes("ambient")) return "🤫";
  if (
    genre.includes("alternative") ||
    genre.includes("rock") ||
    genre.includes("shoegaze") ||
    genre.includes("screamo") ||
    genre.includes("grunge")
  )
    return "🎸";
  return DEFAULT;
};

export default async () => {
  const TV_KEY = Netlify.env.get("API_KEY_TRAKT");
  const scrobbles = getStore('scrobbles')
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=360, stale-while-revalidate=1080",
  };

  const traktRes = await fetch("https://api.trakt.tv/users/cdransf/watching", {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": 2,
      "trakt-api-key": TV_KEY,
    },
  })
    .then((data) => {
      if (data.status) return {}
      if (data.ok) return data?.json();
      throw new Error('Something went wrong with the Trakt endpoint.');
    })
    .catch(err => {
      console.log(err);
      return {}
    });

  if (Object.keys(traktRes).length) {
    if (traktRes["type"] === "episode") {
      return new Response(JSON.stringify({
          content: `📺 <a href="https://trakt.tv/shows/${traktRes["show"]["ids"]["slug"]}">${traktRes["show"]["title"]}</a> • <a href="https://trakt.tv/shows/${traktRes["show"]["ids"]["slug"]}/seasons/${traktRes["episode"]["season"]}/episodes/${traktRes["episode"]["number"]}">${traktRes["episode"]["title"]}</a>`,
        }),
        { headers }
      )
    }

    if (traktRes["type"] === "movie") {
      return new Response(JSON.stringify({
          content: `🎥 <a href="https://trakt.tv/movies/${traktRes["movie"]["ids"]["slug"]}">${traktRes["movie"]["title"]}</a>`,
        }),
        { headers }
      )
    }
  }

  const scrobbleData = await scrobbles.get('now-playing', { type: 'json'})

  if (!scrobbleData) return new Response(JSON.stringify({}, { headers }))

  return new Response(JSON.stringify({
      content: `${emojiMap(
        scrobbleData['genre'],
        scrobbleData['artist']
      )} ${scrobbleData['track']} by <a href="${scrobbleData['url']}">${
        scrobbleData['artist']
      }</a>`,
    }),
    { headers }
  )
};

export const config = {
  cache: "manual",
  path: "/api/now-playing"
};
