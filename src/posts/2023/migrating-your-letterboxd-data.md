---
date: '2023-10-03'
title: Migrating your Letterboxd data
draft: false
tags:
  - development
  - tech
link: https://github.com/jensb89/trakt---letterboxd-import
---
In case you missed the news [Letterboxd was acquired](https://www.nytimes.com/2023/09/29/business/media/letterboxd-new-owner.html) and, assurances about nothing changing quickly followed. But, I think it's safe to say we've seen this movie before.<!-- excerpt -->

I went ahead and migrated my watch history from Letterboxd over to [Trakt](https://trakt.tv), which I already use to keep track of the TV shows I'm watching. To do this I used [a tool](https://github.com/jensb89/trakt---letterboxd-import) written by [Jens Brauer](https://github.com/jensb89). Run through the steps in the README and you should be able to export your data from the newly acquired service[^1].

[^1]: I imported my `diary` data first and then my `watchlist` as the former is a bit more curated than the latter. If you take this approach, wait, let's say, an hour or two to avoid getting rate-limited by the Trakt API.
