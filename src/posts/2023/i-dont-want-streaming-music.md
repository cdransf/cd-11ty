---
date: '2023-04-05'
title: "I don't want streaming music, I just want to stream my music"
draft: false
tags: ['music', 'streaming']
---

I don't want your streaming music service, I just want the music I've collected and care about available to stream.<!-- excerpt -->

Apple Music *kind of* offers this, [with some serious sharp edges to watch out for](/posts/2021/apple-music-a-tale-of-woe/). Spotify doesn't offer this, neither does YouTube Music. Want to stream music? Sign up for a service, hope your favorite artists and albums don't rot out of their catalogue and run with the algorithmic recommendations sourced from that ever-shifting catalogue[^1].

I have the audio files for the music I care about and I've spent a long time collecting them. They're all tagged and named consistently using [Meta](https://www.nightbirdsevolve.com/meta/)[^2], shuffled off to an external hard drive, encrypted and mirrored up to B2 and GCP. *I just want to listen to them without using all of my local storage to do so.*

I leaned on iTunes Match to do this for a while but, funnily enough, Apple will still dedupe your audio against their cloud catalog, overriding meta tags and audio availability as they see fit.[^3] You can sync music into Spotify via playlists, but that's not a scalable solution to, well, much of anything.

I've got a bucket of files locally that I want to listen to — I want a bucket in the cloud with a player attached that'll send data to Last.fm[^4]. I want a solution that lets me play my music without a cloud providers algorithmic nonsense and restrictions applied to it.

This leaves me in a place where I've ruled out the popular streaming music providers and looking for something considerably more niche. Here's what I've explored:

- **[VOX Music Cloud:](https://vox.rocks)** this does what I need, but I don't like any of their player software. It works, but it doesn't feel *right* — their desktop app feels like a mini player, the new beta is missing features and the iOS app isn't enjoyable to navigate.
- **[Astiga:](https://asti.ga)** nicely designed, supports the [Subsonic music API](http://www.subsonic.org/pages/api.jsp) and lets you source music from cloud storage. **Awesome.** Not awesome: I don't particularly like any of the available iOS apps and scrobbling from iOS to Last.fm is inconsistent. Not perfect — absolutely worth keeping an eye on as it develops.
- **[Roon:](https://roonlabs.com)** a very promising service, but one geared more towards the audiophile audience and with hardware requirements I'm not interested in investing in at this point.

Pretty limited, right? My solution and the one I'm really enjoying is [Plexamp](https://plexamp.com/). I knew Plex supported music playback — I didn't realize they had an excellent, bespoke app to support it.[^5] Plex scrobbles to Last.fm from the server, autopopulates artist metadata, does a stellar job matching similar artists and building playlists from *your own collection*. That's it, that's what I wanted. I don't want the collection to drift, I'll add to it when I find music that I want to listen to more than once and *sometimes*, I want to throw on a station or playlist constrained to that set of artists.

So here we are: I have a cloud-based Plex instance, it's used solely for music playback, the artist images match up with Last.fm and [my now page](/now). The metadata is defined the way I've elected to define it, and it's available via a [rclone](https://rclone.org) mount to Google Drive. This is all more complicated than listening to music should be, but I can hit play and listen to what I want to (and get decent recommendations too). Apparently that's too much to ask for from most services, or maybe I'm just out of touch.[^6]

[^1]: When I last leveraged Apple Music's catalogue I kept a smart playlist that highlighted releases that fell out of their streaming catalogue.
[^2]: One of those apps that does exactly what it sets out to in a robust and reliable manner — plus it's native to macOS. Go buy it.
[^3]: Does anyone know what music in the genre 138 sounds like? No? Apple seems to think different artists in my catalogue fit the bill.
[^4]: Their recommendations are still the best — funny how gleaning data from dedicated fans' listening habits'll do that.
[^5]: It's not native, but it's so good that I really don't care.
[^6]: Probably both.
