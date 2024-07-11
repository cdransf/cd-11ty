---
title: Colophon
layout: page
permalink: /colophon.html
description: The tools I use to build and maintain this site.
---
<h2 class="page-header">{{ title }}</h2>

This site is built and maintained using a number of tools.

- The frontend of the site is built using [11ty](https://www.11ty.dev) and the source for that is openly available on [GitHub](https://github.com/cdransf/coryd.dev).
  - The frontend is hosted on [Cloudflare Pages](https://pages.cloudflare.com) and rebuilds hourly.
- Posts, links and media data (music, watching and books) are stored various tables at [Supabase](https://supabase.com) and managed via a [Directus](https://directus.io) instance hosted at <a class="plausible-event-name=DigitalOcean+referral" href="https://m.do.co/c/3635bf99aee2">DigitalOcean</a>.
  - My contact form is submitted to [Supabase](https://supabase.com) using a Cloudflare worker and entries are available to read in [Directus](https://directus.io).
  - Posts are composed in [Obsidian](https://obsidian.md) before being saved in [Directus](https://directus.io).
- Images are hosted on [Backblaze](https://backblaze.com) B2 and served by <a class="plausible-event-name=bunny.net+referral" href="https://bunny.net?ref=revw3mehej">bunny.net</a>.
- I use <a class="plausible-event-name=DNSimple+referral" href="https://dnsimple.com/r/3a7cbb9e15df8f">DNSimple</a> to register my domains and [DNSControl](https://dnscontrol.org) to configure and manage records.
- I use [Plausible](https://plausible.io) for analytics.
- <a class="plausible-event-name=Feedpress+referral" href="https://feedpress.com/?affid=34370">Feedpress</a> helps normalize my feeds and provides lightweight feed insights.
