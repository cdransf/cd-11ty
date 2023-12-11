---
date: '2023-05-01'
title: 'A Safari-specific guide to making the modern web suck less'
description: "Take a second, turn off all of your browser extensions, go to a popular website that comes to mind and take a look at how bad the default experience is. Bonus points — pull up the dev tools, go to the network tab, filter for JavaScript and see how many analytics suites load."
draft: false
tags: ['iOS', 'macOS', 'Apple', 'privacy', 'tech']
---

Take a second, turn off all of your browser extensions, go to a popular website that comes to mind and take a look at how bad the default experience is. Bonus points — pull up the dev tools, go to the network tab, filter for JavaScript and see how many analytics suites load.<!-- excerpt -->

Here's a quick rundown of extensions and tools, specific to Safari, to make that experience less terrible:[^1]

- [1Blocker](https://1blocker.com): block ads, trackers and myriad other annoyances. My go to adblocker for Safari and it even ships with a handy, dandy local firewall to futz with analytics and trackers embedded in apps.
- [Baking Soda](https://apps.apple.com/us/app/baking-soda-tube-cleaner/id1601151613) and [Vinegar](https://apps.apple.com/us/app/vinegar-tube-cleaner/id1591303229): load videos on YouTube and elsewhere in the native video player. 
- [Banish](https://apps.apple.com/us/app/banish-block-open-in-app/id1632848430): block all those annoying open in app banners.[^2]
- [Stop the Madness](https://underpassapp.com/StopTheMadness/): a Swiss Army knife of an extension aimed at curtailing modern annoyances. It'll route around AMP pages, strip tracking parameters, stops clickjacking, stops url shorteners and myriad other fixes for popular user-hostile patterns. *Essential*.
- [Super Agent](https://www.super-agent.com/): automatically set your cookie preferences to the minimum allowed set.[^3]
- [User Scripts](https://github.com/quoid/userscripts): an open source user scripts extension for Safari. I'll leave this one to your imagination (exercise caution and abandon in equal measure since you'll be running community provided scripts and styles on the sites you visit).

**Bonus points:** sign up for <a href="https://nextdns.io/?from=m56mt3z6" onclick="va('event',{name:'NextDNS referral',data:{location:'Referrals'}})">NextDNS</a> and use their [handy-dandy tool](https://apple.nextdns.io/) to generate a device-specific profile and take advantage of the ability to block anything malicious or irritating at the device level in addition to the options outlined above for Safari.

Now, with all that in place, go back to that same site we started at and see how much less annoying it is, how much quicker it loads (and how many network requests that don't do you any good get blocked).

**Edit:** A curated list of cross-browser resources can also be found on GitHub [@cdransf/awesome-adblock](https://github.com/cdransf/awesome-adblock).

[^1]: We can't fix this (or, well, not easily), but you've still got some agency when browsing.
[^2]: Yay you've got an app — it's probably a web view with more analytics.
[^3]: You can accept whatever you want, I'd recommend sticking with functional cookies only.
