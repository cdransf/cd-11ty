const emojiMap = (genre, artist) => {
  const DEFAULT = "🎧";
  const normalizedArtist = artist?.toLowerCase();
  if (normalizedArtist === "afi") return "⛵️🌅";
  if (normalizedArtist === "agalloch") return "🏔️";
  if (normalizedArtist === "augury") return "☄️";
  if (normalizedArtist === "autopsy") return "🧟";
  if (normalizedArtist === "bedsore") return "🛏️";
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
  if (normalizedArtist === "panopticon") return "🪕🪦";
  if (normalizedArtist === "radiohead") return "📻";
  if (normalizedArtist === "taylor swift") return "👸🏼";
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
  const MUSIC_KEY = Netlify.env.get("API_KEY_LASTFM");
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
      if (data.ok) return data.json();
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

  const trackRes = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=coryd_&api_key=${MUSIC_KEY}&limit=1&format=json`,
    {
      type: "json",
    }
  ).then((data) => {
    if (data.ok) return data.json()
    throw new Error('Something went wrong with the Last.fm endpoint.');
  }).catch(err => {
      console.log(err);
      return {}
    });
  const mbidRes = await fetch("https://coryd.dev/api/mbids", {
    type: "json",
  }).then((data) => {
    if (data.ok) return data.json()
    throw new Error('Something went wrong with the mbid endpoint.');
  }).catch(err => {
      console.log(err);
      return {}
    });
  const artistCapitalizationRes = await fetch("https://coryd.dev/api/artist-capitalization", {
    type: "json",
  }).then((data) => {
    if (data.ok) return data.json()
    throw new Error('Something went wrong with the artist capitalization endpoint.');
  }).catch(err => {
      console.log(err);
      return {}
    });
  const track = trackRes["recenttracks"]["track"][0];
  let mbid = track["artist"]["mbid"];
  let genre = '';
  const artistCapitalization = (artist) => artistCapitalizationRes[artist?.toLowerCase()] || artist
  const artist = artistCapitalization(track["artist"]["#text"]);
  const mbidMap = () => mbidRes[track["artist"]["#text"].toLowerCase()] || "";

  // mbid mismatches
  if (mbidMap() !== "") mbid = mbidMap();

  const artistUrl = mbid
    ? `https://musicbrainz.org/artist/${mbid}`
    : `https://last.fm/music/${track["artist"]["#text"].toLowerCase().replace(/\s+/g, "+")}`;
  const trackUrl = track["mbid"]
    ? `https://musicbrainz.org/track/${track["mbid"]}`
    : track['url'];

  if (mbid && mbid !== "") {
    const genreUrl = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=aliases+genres&fmt=json`;
    const genreRes = await fetch(genreUrl, {
      type: "json",
    }).then((data) => {
      if (data.ok) return data.json()
      throw new Error('Something went wrong with the MusicBrainz endpoint.');
    }).catch(err => {
      console.log(err);
      return {}
    });
    genre = genreRes['genres'].sort((a, b) => b.count - a.count)[0]?.["name"] || "";
  }

  return new Response(JSON.stringify({
      content: `${emojiMap(
        genre,
        artist
      )} <a href="${trackUrl}">${track["name"]}</a> by <a href="${artistUrl}">${
        artist
      }</a>`,
    }),
    { headers }
  )
};

export const config = {
  cache: "manual",
  path: "/api/now-playing"
};
