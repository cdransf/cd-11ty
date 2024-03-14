---
date: '2024-03-14T09:00-08:00'
title: 'Building a reactive website'
description: "No, not that kind. I'm thinking of the indie web kind we're seeing lately. The kind that incorporates content from around the web that the creator of the site cares with and engages with. I find this to be complementary to the popular and well-explained POSSE concept. I've adopted this approach to populating numerous parts of my site, written using Eleventy, via frequent rebuilds."
tags: ['development', 'indie web', 'eleventy', 'rss']
---
No, [not that kind](https://react.dev). I'm thinking of the indie web kind we're seeing lately. The kind that incorporates content from around the web that the creator of the site cares with and engages with. I find this to be complementary to the popular and well-explained [POSSE](https://indieweb.org/POSSE) concept. I've adopted this approach to populating numerous parts of my site, written using [Eleventy](https://www.11ty.dev), via frequent rebuilds.<!-- excerpt -->

I've written at length about how I've implemented the various parts of this but, at a less technical  level, this consists of making network calls out to a number of services that I interact with, connecting to either APIs, RSS feeds or even scraping HTML, to incorporate my activity into my site. This started implementing a now page, an idea first crafted and implemented by [Derek Sivers](https://sive.rs/now). Rather than populating this manually (though some parts *are* populated manually), a good portion of it has been sourced automatically from my activity around the web.

This automated approach to sourcing data allows me to share the music I love on this page, displaying artists and albums (I host and optimize my artist and album images before optimizing them). I keep upcoming album releases in a calendar and these get displayed by parsing the ICS output to JSON. My books are updated by retrieving my profile HTML from [The Storygraph](https://app.thestorygraph.com) with a cookie sent to allow me to extract my reading progress.

My links page is sourced from the Readwise Reader API (and only surfaces links I've tagged with `share` and archived) which is paginated and rate-limited, so I store historical link data in a B2 bucket and merge it with newly fetched links. I track my movie and tv watching activity using [Trakt](https://trakt.tv)[^1], with [The Movie Database](https://www.themoviedb.org)supplying images.

All of this has branched out beyond my now page — my home page intro features a sentence summarizing what I've been listening to most recently, the book I've last read and the TV show I've last watched. This draws from the first object in the arrays of my fetched data for each of these categories. My status display draws from omg.lol, my now playing element and, one of the few, dynamic components of the site leverages an edge function to display what I'm checked into on Trakt or the song I've listened to most recently via [last.fm](https://last.fm).

This branches out yet further — I have a component that renders my most popular posts, drawing on [Plausible Analytics](https://plausible.io)' API. This is paired with a recent links component that draws on my Readwise Reader-sourced link data.

I cycle back to [POSSE](https://indieweb.org/POSSE) by generating a JSON feed of my posts, links, books and movie activity that is [syndicated to Mastodon](https://github.com/nhoizey/github-action-feed-to-mastodon). Hashtags are added for discovery by transforming tags I apply in both Readwise and my blog posts — movie and book hashtags are static. I fetch my weekly top artist charts from [last.fm](https://last.fm), cache the JSON and include it in the same syndicated feed.

Syndicated posts are cached, and then exposed as data within my Eleventy site. The link to each Mastodon post is included in this cache and used to populate a [web component](https://github.com/daviddarnes/mastodon-post) at the bottom of each blog post that displays and links back to the Mastodon post. Changes feed in, get POSSE'd out and return with updates triggered by that syndication.

Every time I engage with something that I find interesting on the web and am invested in online my site will, eventually, rebuild and react to that activity. It's a less immediate update cycle, but a consistent one. It's *reactive* in that it updates to everything I've connected to and it remains extremely performant because there's no need to update it with these changes dynamically. It'll happen over time, shifting with my focus.

[^1]: I don't trust the track record of Letterboxd's new owners.