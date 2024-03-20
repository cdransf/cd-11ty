---
date: '2024-03-20T12:23-08:00'
title: 'An indie web primer'
description: "If I haven't made it clear enough recently, I love where the open web is heading and the indie web's part in it. This has grown out of the opportunity created by the ongoing fragmentation of the corporate social web and renewed interest in staking out personal spaces on the web. I've been blogging for a while and this is the longest period with which I've stuck with it and the most I've enjoyed it."
tags: ['tech', 'development', 'indie web']
---
If I haven't made it clear enough recently, I love where the open web is heading and the indie web's part in it. This has grown out of the opportunity created by the ongoing fragmentation of the corporate social web and renewed interest in staking out personal spaces on the web. I've been blogging for a while and this is the longest period with which I've stuck with it and the most I've enjoyed it.<!-- excerpt -->

As with most things I do, I dove headlong into building this site and figured out a lot of details along the way and after the fact. A lot of what I've done has been thoroughly inspired by the wonderful community on Mastodon and I firmly believe that it, and other, ActivityPub-based, decentralized networks are a key part of a more open web.

These are reasons why I find this all so compelling and some pointers, tips and scattered advice on pursuing it.

---

### The why
- You get to own your own content.
- You can move it, publish it and share it wherever you'd like.
- You can exercise control over its presentation, distribution and access.
- <strong class="highlight-text">You can own your home and identity online.</strong>

---

### The how

**Register a domain[^1]:**

 I'm partial to <a class="plausible-event-name=DNSimple+referral" href="https://dnsimple.com/r/3a7cbb9e15df8f">DNSimple</a>, but there are many other awesome options like  [porkbun](https://porkbun.com) and [hover](https://www.hover.com).

**Choose a blogging service[^2]:**

- [omg.lol](https://home.omg.lol) (keep an eye on [Neato](https://neato.pub) too!)
- [Micro.blog](https://micro.blog)
- [Pika](https://pika.page)
- [Scribbles](https://scribbles.page)
- [Bear](https://bearblog.dev)

**If you're technically inclined (or looking to learn), build your own blog:**

- [11ty](https://www.11ty.dev): a delightful static site generator with a wonderful community (I may be bised).
- [Hugo](https://gohugo.io): I've heard good things, but haven't used it myself — if you like Go I'm confident it's a good option.
- [Jekyll](https://jekyllrb.com): a long-running static site generator with its first proper release dating to 2013.
I'm hesitant to recommend more complex options, though there are many (like spinning something up in Next.js or another React-based meta-framework, which feels a bit like using a jackhammer when a traditional hammer would suffice).

**Hosting:**

- **[Netlify](https://www.netlify.com):** my personal choice as I leverage a number of their features *but* I understand that their offerings may be more than what's needed for a personal project.
- **[NeoCities](https://neocities.org):** a well-regarded option for hosting static sites. It also offers a directory to browse of the numerous sites hosted on its platform.
- **[Hetzner](https://www.hetzner.com):** a much more “standard” host with countless services and options. I use one of their storage boxes for backups via Arq, but they're a trustworthy option for site and application hosting.

**Analytics:**

- **[Plausible](https://plausible.io):** my choice for basic traffic insights — I also use their API to power my popular posts widget.
- **[Fathom](https://usefathom.com):** privacy-focused much like Plausible, with a full Google Analytics importer and a robust set of features. Use [Robb](https://rknight.me)'s [referral link](https://usefathom.com/ref/IXCLSF) if you sign up.
- **[tinylytics](https://tinylytics.app):** analytics geared towards small sites at a reasonable price (build by [Vincent](https://vincentritter.com), who's also working on [Scribbles](https://scribbles.page)).
- **[Umami](https://umami.is):** privacy focused analytics with a [self-hosted offering](https://github.com/umami-software/umami) (if you want to take that on).
- **[GoatCounter](https://goatcounter.com):** light-weight [open source](https://github.com/arp242/goatcounter) and privacy-focused analytics.

**Syndication:**

[POSSE (publish on your own site, syndicate elsewhere)](https://indieweb.org/POSSE) is core to the indie web experience and owning your own content. You publish on your own site and share references to the content out, linking back to its home on your site. This can be done manually, but I prefer to automate the process and there are several options available to do this.
- **[github-action-feed-to-mastodon](https://github.com/nhoizey/github-action-feed-to-mastodon):** a GitHub action from [Nicolas Hoizey](https://github.com/nhoizey) that shares out content from a JSON feed. This is geared towards projects with source hosted on GitHub as it needs to store cache and timestamp data in your project's source.
- **[github-action-feed-to-social-media](https://github.com/lwojcik/github-action-feed-to-social-media):** similar to [Nicolas Hoizey](https://github.com/nhoizey)'s workflow but with support for additional services, this workflow from [Łukasz Wójcik](https://github.com/lwojcik) posts only the most recent item from a provided RSS/Atom feed.
- **[EchoFeed](https://echofeed.app):** a service [Robb](https://rknight.me) is working on with support for a number of platforms and protocols (like web hooks and webmentions). It hasn't yet launched, but looks like an extremely compelling option.
- **No/low code platforms:** services like [IFTTT](https://ifttt.com),  [Make](https://www.make.com) and [Zapier](https://zapier.com) can be used for syndication with configuration and pricing varying for each.

**Webmentions:**

You can send and receive [Webmentions](https://indieweb.org/Webmention) to help send notifications to URLs when you link to them. I collect Webmentions via [webmention.io](https://webmention.io) which works by adding a pair of meta tags to the head of your website.

I displayed Webmentioins on my site up until recently but, after seeing concerns from folks like [Robb](https://rknight.me/blog/mastodon-webmentions-and-privacy/ ) and [Chris](https://chrismcleod.dev/blog/some-words-on-webmentions/) I've removed the display and, instead, link out to my POSSE'd Mastodon posts using [a web component](https://github.com/daviddarnes/mastodon-post) built by [David Darnes](https://darn.es). I use [wm](https://github.com/remy/wm/tree/master) from [Remy Sharp](https://remysharp.com) to send outbound webmentions when my site is built.

You can find detailed information about myriad Webmention sending and receiving services over at [the IndieWeb wiki](https://indieweb.org/Webmention).

**Pages and ideas:**

So you have tools, blogging options and syndication in place — what else can you do?
- Build a [now page](https://nownownow.com/about): [I've automated](https://coryd.dev/posts/2023/building-my-now-page-using-eleventy/) [mine](https://coryd.dev/now), but you can do as much or as little as you'd like with yours.
- Build a uses page
- Build a referrals page
- Build a [blogroll](https://indieweb.org/blogroll) to help share your favorite blogs and discover others.
- Join or start a [webring](https://en.wikipedia.org/wiki/Webring).
- Share links — manually, via a links page, via roundup posts — however you'd like. I have a [links page](https://coryd.dev/links/) and [feed](https://feedpress.me/coryd-links). If you're posting them to Mastodon, add hashtags for discoverability.
- Show off photos you've taken — source them from [Pixelfed](https://pixelfed.org) or [Glass](https://glass.photo).

Build whatever you want to showcase and share about yourself, your passions and your interests. That's the beauty of this entire exercise and ecosystem. I [built functionality to “check in” to my site](https://coryd.dev/posts/2023/check-in-to-your-personal-site/). There are endless creative and engaging opportunities on a platform you control. Treat it like a canvas and draw, write and share what you're passionate about.

*Be sure to check out the [IndieWeb wiki](https://indieweb.org) for tons of helpful information.*

[^1]: Some services support custom domains (and if not, consider asking for support) and you can always forward it to your blog.
[^2]: These are *great* less technical services run by wonderful people with a lower barrier to entry.