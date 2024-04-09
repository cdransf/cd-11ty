---
date: '2024-04-09T15:00-08:00'
title: 'A retrospective on a year without streaming music'
description: "I wrote, roughly a year ago, about wanting to stream my own music and I've spent that time exploring and settling into options. I still don't want streaming music and I don't miss it, but I've learned a few things along the way."
tags: ['tech', 'music']
---
[I wrote, roughly a year ago, about wanting to stream my own music](https://coryd.dev/posts/2023/i-dont-want-streaming-music/) and I've spent that time exploring and settling into options. I still don't want streaming music and I don't miss it, but I've learned a few things along the way.<!-- excerpt -->

<strong class="highlight-text">Let's get one thing out of the way up front: streaming music is bad for artists.</strong>[^1]

**[Trent Reznor, via NME:](https://www.nme.com/news/music/nine-inch-nails-trent-reznor-says-streaming-has-mortally-wounded-many-artists-its-great-if-youre-drake-its-not-great-if-youre-3614437)**
> "I think the terrible payout of streaming services has mortally wounded a whole tier of artists that make being an artist unsustainable," he said.
>
> "And it's great if you're Drake, and it's not great if you're Grizzly Bear. And the reality is: Take a look around. We've had enough time for the whole ‘All the boats rise' argument to see they don't all rise. Those boats rise. These boats don't. They can't make money in any means. And I think that's bad for art."

It was hard enough to make a living as an artist before streaming and it's nearly impossible to now. Recorded music has become a loss-leader for tours and touring is grueling[^2].

Artists were better off when we were toting around iPods, Zunes, Dell Digital Jukeboxes and buying mp3s one at a time. I think we were too.

I've always been a fan of manual curation and the care that goes into maintaining a collection, but instead of subsidizing a streaming "collection" to fill in gaps, I've retaken ownership of the whole thing. This has been both limiting and empowering — I can't turn on a radio station but I can remember what's in my collection and what I want to throw on[^3].

I track album releases via [MusicHarbor](https://apps.apple.com/us/app/musicharbor-track-new-music/id1440405750), [RateYourMusic](https://rateyourmusic.com) and RSS. Anything I care about goes on an `Albums` calendar, and [that ICS feed gets parsed and displayed on my site](https://coryd.dev/now.html). Recommendations come from friends, Last.fm and, again [RateYourMusic](https://rateyourmusic.com). I buy music from Bandcamp, 7digital and a few other retailers as availability dictates. I pick up vinyl and have too many band shirts[^4].

| Service/app                                                  | Type                             | Price                                 |
|--------------------------------------------------------------|----------------------------------|---------------------------------------|
| [Astiga](https://asti.ga)                                    | Playback from compatible storage | $4.99/month or $49.90/year            |
| [Doppler](https://brushedtype.co/doppler/)                   | Local music player (macOS/iOS)   | $30 for macOS, $9 for iOS             |
| [emby](https://emby.media)                                   | Media server                     | Varies                                |
| [iBroadcast](https://www.ibroadcast.com/home/)               | Cloud locker                     | $3.99/month or $44.99/year            |
| [Jellyfin](https://jellyfin.org)                             | Media servier                    | Varies                                |
| [Plex](https://www.plex.tv)/[Plexamp](https://www.plex.tv/plexamp/) | Media server                     | Varies                                |
| [Roon](https://roon.app)                                     | Music server                     | $14.99/month or $12.49/month (annual) |
| VLC                                                          | Local media player               | Variable donations                    |
| [Vox Music Cloud](https://vox.rocks)                         | Cloud locker                     | $4.99/month                           |

Astiga remains a strong and flexible option, but I still don't love the Subsonic player landscape. Doppler is fantastic, but constrained by your local storage[^5]. I've yet to try emby and I quite liked Jellyfin when I took it for a brief spin — [Manet](https://tilo.dev/manet/) is a great app to use with it. I'm not committed enough to set up a Roon server and VOX Music Cloud still fails to excite me. All of this is to say outside of a brief (and fun) run with Doppler, I'm sticking with Plexamp[^6].

Plex provides a great balance of features and flexibility — Plexamp isn't native but it's still a joy to use. I get to update my metadata, update every single artist image[^7] — I even cleaned up the album genres Plex runs with (it was tedious, but here I am on the other side of the process). I'm scrobbling plays to Last.fm and ListenBrainz but am [surfacing data](https://coryd.dev/now#artists) from [my own — relatively — simple implementation](https://coryd.dev/posts/2024/building-a-scrobbler-using-plex-webhooks-edge-functions-and-blob-storage/).

I don't miss playlists, I've kept up with artists I care about and I've discovered new ones along the way. I remember what I have on hand and know what suits a given mood. I pay artists where I can and wish I could do more. [I have enough to keep me entertained](https://coryd.dev/posts/2024/we-have-a-content-quality-problem-not-a-content-quantity-problem/) and I'm glad I made the change.

[^1]: It has and will only continue to get worse as said services look to increase profits. [It's already looking grim for small artists](https://metalinjection.net/its-just-business/songs-need-at-least-1000-plays-yearly-on-spotify-to-get-royalties-in-2024) — just wait until they're dropping releases in the same fashion as TV streamers or — imagine it — replacing actual artists with AI sludge.
[^2]: There are ever more hands out looking for a cut of merch sales on tour as well.
[^3]: My wife made the comment that I'm one of the few people that still listens to albums and I think there's a lot to be said for respecting the artist's intent and effort that went into sequencing the release.
[^4]: I'm down to buying shirts from [Bifocal Media](https://bifocalmedia.com/) when they print something for [NoMeansNo](https://en.wikipedia.org/wiki/Nomeansno) or [Pyre Press](https://www.pyrepressmerch.com/) and [20 Buck Spin](https://www.20buckspin.com/) (because they use Pyre Press for all their shirts).
[^5]: [This isn't a bad thing, necessarily.](https://coryd.dev/posts/2023/locally-stored-music-and-storage-as-a-meaningful-constraint/)
[^6]: If things go sideways, Jellyfin is the runner up.
[^7]: I can do it, so I must.