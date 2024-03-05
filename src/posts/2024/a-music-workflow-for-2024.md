---
date: '2024-03-05'
title: 'A music workflow for 2024'
description: "I think, I think I've found a music workflow I'm happy with for 2024 and it looks like this."
tags: ['music', 'tech']
---
I think, *I think* I've found a music workflow I'm happy with for 2024 and it looks like this.<!-- excerpt -->

- Store upcoming releases in a calendar
  - These releases get parsed from an ICS feed and [displayed on my now page](https://coryd.dev/now#album-releases).
- When an album gets released, I tag it using [Meta](https://www.nightbirdsevolve.com/meta/)[^1]
  - I export the artwork to a directory where I store all the art for all the albums I listen to. This gets pushed to GitHub after Hazel normalizes the name to an `artist-album-name` format.
  - I upload the artwork to my CDN and my now page then uses the data returned by Last.fm's API to match the filename on the CDN when building my site.
    - If the album is from a new artist, repeat this process with an image of the artist.
  - I upload the artwork to a shared Apple Photos album that I use as my screensaver.
  - I move the music files to a drive that gets backed up to Backblaze.
- I import the album to [Doppler](https://brushedtype.co/doppler/).
  - I send the album to Doppler on my iPhone

From there, I listen to music. It shows up on https://www.last.fm/user/coryd_, my site and my screensaver.

[^1]: No not that one.