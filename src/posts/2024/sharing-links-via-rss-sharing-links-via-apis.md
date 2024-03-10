---
date: '2024-03-10T10:00-08:00'
title: 'Sharing links via RSS, sharing links via APIs'
description: "I follow and subscribe to a whole bunch of blogs and less and less high-volume news via RSS. It's one of my absolute favorite mediums for keeping up with and reading content on the web."
tags: ['development', 'Eleventy', 'javascript', 'RSS', 'AI']
---
I follow and subscribe to a whole bunch of blogs and less and less high-volume news via RSS. It's one of my absolute favorite mediums for keeping up with and reading content on the web. It's distributed, open and decentralized and remains one of those under-appreciated layers that stitches content across the web together.<!-- excerpt -->

For the past year and change I've been using [Readwise's Reader](https://readwise.io/read) as my RSS and read it later app of choice. It has a lightweight API that consists of, essentially, a `read` and `write` endpoint.The read endpoint is paginated and they were even kind enough to add a `source_url` property when asked. Their `read` endpoint is paginated and rate-limited[^1] so I [cache the data I need from my saved articles in a B2 bucket](https://coryd.dev/posts/2024/using-b2-as-a-json-data-store/).

I fetch new links when my site rebuilds, adding them to [my links page](https://coryd.dev/links) and [my now page](https://coryd.dev/now#links). Next, to actually *share* the links, I build [an RSS feed sourced from the fetched Readwise data](https://feedpress.me/coryd-links) (the Readwise endpoint also provides link descriptions that you can see in the feed) and a JSON feed that's syndicated periodically to Mastodon.[^2]

All of this is kicked off when I tag a link as `share` and archive it to offer some reasonable assurance that I've read it. This is all a bit contrived, I suppose and I had expected it to be more fragile than it's proven to be.

---

Implementation aside, all of this goes to what makes the web so interesting and has for a long time. It's all links and all links can be shared on an equal, open basis. It's up to us to share and surface what we like and to continue doing so. To a degree it's about curation but it's really about highlighting things you've liked in the hopes that someone else will too.

It's encouraging to see more and more folks sharing links, boosting them and blogging them. It makes discovery easier when it's done cooperatively.

We're heading towards a web filled with more AI-generated and SEO-motivated sludge which, while heartbreaking, can be countered in minor degrees by being discerning readers and continuing to share. We don't need AI mediating sharing or discovery and, frankly, products like Arc Search are both insulting to users and creators — they both assume that they know better than users by surfacing summations and snippets of content, while providing now benefit to the owners of sites that they're scraping.

Jim Nielsen got this quite right in [his post about subversive hyperlinks](https://blog.jim-nielsen.com/2024/the-subversive-hyperlink/):

> The web has a superpower: permission-less link sharing.
>
> I send you a link and as long as you have an agent, i.e. a browser (or a mere HTTP client), you can access the content at that link.
>
> This ability to create and disseminate links is almost radical against the backdrop of today’s platforms.

We're all empowered to engage in this and platforms can't control it or take that away. They can and, annoyingly, do engage in putting scare screens in front of users that are linked *out* of their platforms but they cannot change the fundamental behavior.

A lot has changed and the commercialization of the web has yielded barriers and walled gardens, but `feed://` and `http(s)://` persist to enable unmediated discovery and distribution and that's more important than ever.

[^1]: Which totally makes sense! Abuse is bad and performance is important.
[^2]: The technical details are [written up in another post](https://coryd.dev/posts/2024/link-blogging-using-readwise/).