---
date: '2023-03-27'
title: 'Automate and syndicate content from Eleventy to Mastodon'
draft: false
tags: ['automation', 'Mastodon', 'Eleventy']
---

I've discussed [building a now page using Eleventy](/posts/2023/building-my-now-page-using-eleventy/) but I also syndicate a subset of that content out to Mastodon using [`@11ty/eleventy-activity-feed`](https://www.npmjs.com/package/@11ty/eleventy-activity-feed) and [Make](https://make.com).<!-- excerpt --> The [`@11ty/eleventy-activity-feed`](https://www.npmjs.com/package/@11ty/eleventy-activity-feed) allows you to aggregate various web feeds into a single feed, inserting entries from the feeds sequentially as they're published. My `follow-feed.11ty.js`  looks like this:

```javascript
module.exports = class {
	data() {
		return {
			permalink: '/follow.xml',
		}
	}

async render() {
		const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
		const feed = new ActivityFeed()
		feed.addSource('atom', 'Blog', 'https://coryd.dev/feed.xml')
		feed.addSource('rss', 'Letterboxd', 'https://letterboxd.com/cdme/rss')
		feed.addSource('rss', 'Glass', 'https://glass.photo/coryd/rss')
		feed.addSource('rss', 'Oku', 'https://oku.club/rss/collection/NvEmF')
		
		return feed.toRssFeed({
			title: "Cory Dransfeldt's activity feed",
			language: 'en',
			url: 'https://coryd.dev/follow/',
			subtitle: "Cory Dransfeldt's activity across the web.",
		})
	}
}
```

As I update the above feeds, my activity feed found at <https://coryd.dev/follow.xml> updates. My workflow at Make[^1] watches `/follow.xml`, checking it every 2 hours and posting the newest item title and url to Mastodon.

If you elect to use Make for something like this you'll need to leverage the RSS module, which I've configured to return a maximum of 3 items per check and either the Mastodon or HTTP module (I've used the latter as the former errored when accessing my instance). If you use the HTTP module, the configuration is fairly simple:

1. Log in to your instance, accessing the prefererences, then the `Development` menu.
2. Create a new application, naming it whatever you'd like (mine is named coryd.dev[^2]) with the `write:statuses` scope.
3. Head back to Make, connecting an HTTP module to your RSS module.
4. Add a heading named `Authorization` with a value of `Bearer <TOKEN OBTAINED FROM YOUR MASTODON INSTANCE>`
5. Add a second heading named `Accept` with a value of `application/json`
6. Set the body type to `Application/x-www-form-urlencoded`
7. Add a field with the key set to `status` and the value to the `Title` and `URL` data obtained from your RSS module.
8. Save and schedule the scenario to run at your preferred frequency.

You should now see posts from your follow feed being sent off to your Mastodon instance as they're updated.

[^1]: A drag and drop automation service much like Zapier or IFTTT.
[^2]: For the sake of vanity or clarity with respect to the source of the post.