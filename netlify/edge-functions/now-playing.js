const emojiMap = (genre, artist) => {
  const DEFAULT = "🎧";
  if (artist === "Augury") return "☄️";
  if (artist === "Autopsy") return "🧟";
  if (artist === "Black Flag") return "🏴";
  if (artist === "Bruce Springsteen") return "🇺🇸";
  if (artist === "Carcass") return "🥼";
  if (artist === "Counting Crows") return "🐦‍⬛";
  if (artist === "David Bowie") return "👨🏻‍🎤";
  if (artist === "Full of Hell & Nothing") return "🫨🎸";
  if (artist === "Imperial Triumphant") return "🎭";
  if (artist === "Mastodon") return "🐋";
  if (artist === "Minor Threat") return "👨🏻‍🦲";
  if (artist === "Taylor Swift") return "👸🏼";

  // early return for bad input
  if (!genre) return DEFAULT;

  if (genre.includes("death metal")) return "💀";
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
    genre.includes("screamo")
  )
    return "🎸";
  return DEFAULT;
};

export default async () => {
  const TV_KEY = Netlify.env.get("API_KEY_TRAKT");
  const MUSIC_KEY = Netlify.env.get("API_KEY_LASTFM");
  const headers = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control":
        "public, max-age=0, stale-while-revalidate=210",
    },
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
      return Response.json(
        {
          content: `📺 <a href="https://trakt.tv/shows/${traktRes["show"]["ids"]["slug"]}">${traktRes["show"]["title"]}</a> • <a href="https://trakt.tv/shows/${traktRes["show"]["ids"]["slug"]}/seasons/${traktRes["episode"]["season"]}/episodes/${traktRes["episode"]["number"]}">${traktRes["episode"]["title"]}</a>`,
        },
        headers
      );
    }

    if (traktRes["type"] === "movie") {
      return Response.json(
        {
          content: `🎥 <a href="https://trakt.tv/movies/${traktRes["movie"]["ids"]["slug"]}">${traktRes["movie"]["title"]}</a>`,
        },
        headers
      );
    }
  }

  const nbaRes = await fetch(
    "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
  )
    .then((data) => {
      if (data.ok) return data.json()
      throw new Error('Something went wrong with the NBA endpoint.');
    })
    .catch(err => {
      console.log(err);
      return {}
    });
  const games = nbaRes?.scoreboard?.games;

  if (games && games.length) {
    const isAmPm = (hours) => (hours >= 12 ? "pm" : "am");
    const game = games.find((game) => game.gameCode.includes("LAL"));
    if (game) {
      const startDate = new Date(game.gameTimeUTC);
      const startTime = startDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const endDate = startDate.setHours(startDate.getHours() + 3);
      const endTime = new Date(endDate).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const nowDate = new Date();
      const now = nowDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const isCorrectDate =
        now.split(",")[0] === startTime.split(",")[0] &&
        now.split(",")[0] === endTime.split(",")[0] &&
        isAmPm(startDate.getHours()) === isAmPm(nowDate.getHours());
      const nowHour = parseInt(now.split(",")[1].split(":")[0].trim());
      const startHour = parseInt(startTime.split(",")[1].split(":")[0].trim());
      const endHour = parseInt(endTime.split(",")[1].split(":")[0].trim());
      const nowMinutes = parseInt(now.split(",")[1].split(":")[1].trim());
      const startMinutes = parseInt(
        startTime.split(",")[1].split(":")[1].trim()
      );
      const endMinutes = parseInt(endTime.split(",")[1].split(":")[1].trim());
      const res = {
        content: `🏀 ${game["awayTeam"]["teamName"]} (${game["awayTeam"]["wins"]}-${game["awayTeam"]["losses"]}) @ ${game["homeTeam"]["teamName"]} (${game["homeTeam"]["wins"]}-${game["homeTeam"]["losses"]})`,
      };

      if (isCorrectDate) {
        if (
          nowHour === startHour &&
          nowMinutes >= startMinutes &&
          nowHour < endHour
        )
          return Response.json(res, headers);
        if (nowHour > startHour && nowHour < endHour) return Response.json(res);
        if (
          nowHour > startHour &&
          nowMinutes <= endMinutes &&
          nowHour == endHour
        )
          return Response.json(res, headers);
      }
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
  const track = trackRes["recenttracks"]["track"][0];
  const artist = track["artist"]["#text"];
  let mbid = track["artist"]["mbid"];
  let genre = "";
  const mbidMap = (artist) => mbidRes[artist.toLowerCase()] || "";

  // mbid mismatches
  if (mbidMap(artist) !== "") mbid = mbidMap(artist);

  const artistUrl = mbid
    ? `https://musicbrainz.org/artist/${mbid}`
    : `https://musicbrainz.org/search?query=${track["artist"]["#text"].replace(
        /\s+/g,
        "+"
      )}&type=artist`;
  const trackUrl = track["mbid"]
    ? `https://musicbrainz.org/track/${track["mbid"]}`
    : `https://musicbrainz.org/search?query=${track["artist"]["#text"].replace(
      /\s+/g,
      '+'
    )}&type=artist`;

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

  return Response.json(
    {
      content: `${emojiMap(
        genre,
        track["artist"]["#text"]
      )} <a href="${trackUrl}">${track["name"]}</a> by <a href="${artistUrl}">${
        track["artist"]["#text"]
      }</a>`,
    },
    headers
  );
};

export const config = { path: "/api/now-playing" };
