---
date: '2024-02-22'
title: 'Weaving music data in and out of my personal website'
description: "I started integrating music data into my personal website when I added Last.fm artist and album displays to my now page. Initially, I tried sourcing artist images from a few different services, knowing that Last.fm had updated their API to stop serving them. After a fair bit of searching I found that most services that supplied artist images covered only a small fraction of my library and often supplied the wrong image when there were multiple artists sharing the same name."
tags: ['Eleventy', 'javascript', 'development', 'music', 'Last.fm']
---
I started integrating music data into my personal website when I added Last.fm artist and album displays to my [now page](https://coryd.dev/now). Initially, I tried sourcing artist images from a few different services, knowing that Last.fm had updated their API to stop serving them. After a fair bit of searching I found that most services that supplied artist images covered only a small fraction of my library and often supplied the wrong image when there were multiple artists sharing the same name.<!-- excerpt -->

This led me down the path of collecting and hosting my own artist images. These images get sourced from my CDN at build time and are all matched based on name after being normalized to lowercase with `-` delimiters.

Recently, Last.fm's album images have been returned less reliably by their API — I noticed this cropping up with a higher rate of build failures and my preferred screensaver, [Musaic.fm](https://github.com/obrhoff/MusaicFM), failing to start. To solve this, I used [Meta](https://www.nightbirdsevolve.com/meta/) to export the art from my music collection, [Hazel](https://www.noodlesoft.com/) to rename it to `artist-album-name.jpg` and uploaded it all to my CDN. Now, I use the data from Last.fm's API response to match the album on my CDN rather than trusting their images. Now, when I import a new release to Doppler I add the album art to my CDN and, if it's a new artist, I do the same with an artist image.

On my home page I have a simple [now-playing](https://coryd.dev/posts/2024/building-a-bespoke-now-playing-web-component/) component that (mostly) displays the most recent track I've listened to. This is, again, sourced from Last.fm but links out to [MusicBrainz](https://musicbrainz.org/) based on the `mbid` Last.fm provides. When Last.fm fails to provide an `mbid`, I've built [a static map to patch missing values](https://coryd.dev/api/mbids). In addition to linking out to MusicBrainz, I've mapped artists and genres (fetched from a MusicBrainz endpoint that returns community-defined genres) to various emoji that are displayed alongside the track:

```javascript
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
```

MusicBrainz also offers a service called [ListenBrainz](https://listenbrainz.org) that functions much like Last.fm, collecting and offering recommendations based off your listening history — they even have a [Last.fm importer](https://listenbrainz.org/settings/import//). I would like to scribble my history to their service directly, but it isn't as broadly supported as Last.fm and I don't want to manually import it (if I can avoid it). So, naturally, I ran test imports using their tool, took a look at the network traffic and set up my own implementation to run the import from Last.fm hourly.

Remember Tweekly.fm? I do and [I decided I wanted something similar for Mastodon](https://coryd.dev/posts/2023/hacking-together-a-tweeklyfm-repalcement/).  Naturally, this meant pulling my chart data from Last.fm using a GitHub action, committing the JSON and coercing it into a feed entry that I can syndicate from my site.

This all still leaves Last.fm as my data hub, but with *some* of the demands no longer made of their API[^1]. I have my data backed up at ListenBrainz and displayed on my personal site since that remains the hub of everything I do online. I realize this is all quite a bit of effort to go through to integrate and display music that most folks probably don't care about, but I learned to write code **because I love music** and being able to fiddle with all this data and all of these APIs feels a bit like that journey coming full circle.

[^1]: I sure hope Viacom/Paramount/CBS/whoever keeps it running and, failing that, everyone pivots to better support the fine folks at the MusicBrainz foundation — they've got [a Last.fm compatible API](https://listenbrainz.readthedocs.io/en/latest/users/api-compat.html) and a [proxy URL](https://listenbrainz.org/lastfm-proxy/). They're doing wonderful work.