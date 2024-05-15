---
date: 2024-05-15T11:31-08:00
title: Adventures in self-hosting data
description: I think my self-hosted scrobbling implementation is, at this point, fairly stable. The charts I'm calculating track pretty closely with last.fm's and I'm inclined to chalk the difference up to how we're calculating/slicing dates.
tags:
  - tech
  - development
  - privacy
  - plex
  - music
  - musicbrainz
---
I think [my self-hosted scrobbling implementation](https://coryd.dev/posts/2024/improving-my-self-hosted-scrobbling-implementation/) is, at this point, fairly stable. The charts I'm calculating track pretty closely with last.fm's and I'm inclined to chalk the difference up to how we're calculating/slicing dates.<!-- excerpt -->

One recent change to my scrobbling implementation was to create a `total_plays` column in my artists and albums tables — this is updated using a trigger so that each row added to the listens table updates the column for the appropriate media record in each.

Additionally, I updated the [anticipated albums section on my now page](https://coryd.dev/now#album-releases) to use my music data (rather than parsing an ICS calendar feed). It displays albums with upcoming release dates, links to the page to buy the album, links the artist name to MusicBrainz and displays the artist genre.

Next up, I've moved all of my reading activity into this site's codebase using [Katy Decorah](https://katydecorah.com)'s fantastic [read-action](https://github.com/library-pals/read-action). This gets displayed on [a dedicated book's page](https://coryd.dev/books/) with sub-pages for books I'd like to read and books I've read over the past several years (since I began tracking this in earnest). Katy's script populates itself by fetching data from Google Books (or other, less robust sources) — in the interest of not serving anything from Google, I threw together a node script that I can run locally which moves book covers to a B2 bucket and updates the JSON file her action generates to point to the images on the bucket.

With music and reading data in house, I moved on to TV and movies. The primary utility of [Trakt](https://trakt.tv) is in tracking when new shows air and preserving your watch history. Rather than tackle the former, I focused in on the latter — I use Apple's TV app to keep up with what I watch as is. Thankfully, for VIP members, Trakt provides a well-structured backup on a regular basis.

Trakt's backups are in JSON so I went to work coercing them into CSVs to upload into tables over at [Supabase](https://supabase.com). I simplified things a fair bit when importing and preserving this:
- For movies I wanted to track when I last watched them, title, year, my play count and whether I'd collected it or considered it a favorite.
- For TV shows I kept a similar data set and linked it to an episodes table via the `tmdb_id`. I used this ID to link out to [TMDB](http://themoviedb.org) and simplify my image URLs.

<img src="https://coryd.dev/.netlify/images/?url=https://coryd.dev/media/blog/watched-media-schema.png&w=1000&fm=webp&q=75" class="image-banner" loading="lazy" decoding="async" alt="A diagram of my watched media tables" width="1000" height="434" />
The watched data for [my now page](https://coryd.dev/now) is now sourced from these tables and I've built out [a dedicated watching page](https://coryd.dev/watching/). The hero image is randomly selected from my favorite movies at built time, as are the 6 TV shows and movies in their respective favorite sections.

I have lists of shows and movies I'm planning to watch (primarily for my own purposes) for anyone to view.

The next big piece of all of this is keeping things updated. Supabase has a rather pleasant UI and I can edit tables by hand if needed (though my music typically keeps rolling on as listens are recorded). But, to put a friendlier face on things, I went ahead and threw a [Directus](https://directus.io) instance on the cheapest available Digital Ocean droplet. [They even have a handy guide on getting this up and running.](https://docs.directus.io/blog/deploy-directus-digital-ocean-docker.html)[^1] It's a CMS inasmuch as all of this media data is concerned and simplifies adding records without touching tables directly — I even themed it and threw some useful links in the sidebar.

---

Is all of this necessary? I don't know but Last.fm has felt increasingly rickety and it *is* owned by Paramount, [which doesn't seem to be doing all that well](https://finance.yahoo.com/news/sony-rethinking-bid-paramount-cnbc-182222745.html). If they struggle, that is all data that they can do, well, *something* with. I started looking at options to hold on to that data, even if it came with overhead.[^2]

Once I made changes to where my listening data was stored, it felt natural to do the same with the data for what I read and watch. I displayed it on my site and I could continue doing that while sourcing it from a database I control. I traded some simplicity (I was still dealing with the vagaries of a number of different APIs) for some added complexity and ownership. I'm happy with that trade so far. We'll see how it goes.

[^1]: The only bumps I encountered were that the `ADMIN_PASSWORD` value isn't necessary — that's the default value that you can change when you log in. I also didn't use Digital Ocean for storage (B2 again) which meant removing `_DIGITALOCEAN_` from those keys and setting `s3` as the value for `STORAGE_LOCATIONS`. You can delete `DB_SSL__CA=""` too.
[^2]: I *love* ListenBrainz and send plays there too.