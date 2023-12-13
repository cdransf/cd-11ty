---
date: '2014-02-27'
title: 'Automatic Feedbin subscription backups'
description: "A few weeks ago I switched from Fever to Feedbin. I had been using Fever on a shared hosting account and, over the long term, was proving to be slower than I had expected it to be."
draft: false
tags: ['automation']
---

A few weeks ago I switched from [Fever.](http://feedafever.com/ 'Fever° Red hot. Well read.') to [Feedbin](https://feedbin.me/ 'Feedbin'). I had been using Fever on a shared hosting account and, over the long term, was proving to be slower than I had expected it to be.<!-- excerpt --> So far Feedbin has proven to be considerably faster than my old Fever install and appears to be more actively developed (I've also been able to use Jared Sinclair's [Unread](http://jaredsinclair.com/unread/ 'Unread — An RSS Reader') — it's fantastic).

I plan on sticking with Feedbin as my RSS service, but also wanted to make sure I kept a backup of all the feeds I subscribe to just in case anything happens to change. Rather than manually exporting a JSON backup of my feeds on a regular basis, I threw together the following shell script to download the JSON file via Feedbin's API and save it to Dropbox:

```bash
"curl -u 'example@example.com:password' https://api.feedbin.me/v2/subscriptions.json -o ~/Dropbox/Backups/Feedbin/feedbin-subscriptions.json"
```

I have the above script saved and used [Lingon](http://www.peterborgapps.com/lingon/ 'Lingon - Peter Borg Apps') to schedule it to run automatically once a week, alleviating the need for me take the time to back up my RSS subscriptions by hand. To use the script, you simply need to drop in your Feedbin credentials, save it wherever you'd like and then add it and schedule it to run via Lingon.
