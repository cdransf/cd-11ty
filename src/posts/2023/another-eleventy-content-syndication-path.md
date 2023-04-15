---
date: '2023-03-28'
title: 'Another Eleventy content syndication path'
draft: false
tags: ['Eleventy', 'Mastodon', 'JSON', 'RSS']
---

After posting and [discussing](https://social.lol/@nhoizey@mamot.fr/110101373765987885) [my post from yesterday](/posts/2023/automate-syndicate-content-mastodon-eleventy/) with [Nicolas Hoizey](https://nicolas-hoizey.com/) I decided to explore his suggested path and explore using a GitHub action to handle posts to Mastodon, rather than Make.<!-- excerpt --> Nicolas, thankfully, [has an action that supports exactly this path](https://github.com/marketplace/actions/any-feed-to-mastodon). It currently supports JSON feeds, [with planned support for Atom/RSS](https://github.com/nhoizey/github-action-feed-to-mastodon/issues/16).[^1]

For now, to surface my Eleventy activity feed as JSON, we peak under the hood of [`@11ty/eleventy-activity-feed`](https://www.npmjs.com/package/@11ty/eleventy-activity-feed) and, rather than calling `toRssFeed`, call `getEntries` and use the merged feed data it returns as JSON to construct a [`follow.json`](https://coryd.dev/follow.json) feed in [`src/_data/follow.js`](https://github.com/cdransf/coryd.dev/blob/66085dfdb1fab7bd46b8aa3e4b5e40ced906fb93/src/_data/follow.js)[^2]

```javascript
module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  feed.addSource('atom', 'Blog', 'https://coryd.dev/feed.xml')
  feed.addSource('rss', 'Letterboxd', 'https://letterboxd.com/cdme/rss')
  feed.addSource('rss', 'Glass', 'https://glass.photo/coryd/rss')
  feed.addSource('rss', 'Oku', 'https://oku.club/rss/collection/NvEmF')
  const entries = feed.getEntries()
  const res = await entries
  const activity = { posts: [] }
  res.forEach((entry) =>
    activity.posts.push({
      id: entry.url,
      title: entry.title,
      url: entry.url,
      content_html: entry.content || '',
      date_published: entry.published,
    })
  )
  return activity
}
```

We can then render this to our desired feed in [`follow.11ty.liquid`](https://github.com/cdransf/coryd.dev/blob/66085dfdb1fab7bd46b8aa3e4b5e40ced906fb93/src/follow.11ty.liquid):

{% raw %}

```json
---
permalink: '/follow.json'
---
{% assign posts = follow.posts %}
{
"version": "https://jsonfeed.org/version/1",
"title": "All activity • Cory Dransfeldt",
"icon": "https://coryd.dev/static/images/avatar.webp",
"home_page_url": "https://coryd.dev",
"feed_url": "https://coryd.dev/follow.json",
"items": [{% for item in posts %}
  {
  "id": "{{ item.id }}",
  "title": "{{ item.title }}",
  "url": "{{ item.url }}",
  "content_html": "",
  "date_published": "{{ item.date_published | date: "%Y-%m-%dT%H:%M:%S-08:00" }}"
  }{% if not forloop.last %},{% endif %}
{% endfor %}
]
}
```

{% endraw %}

Finally, we skip the Make-dependent portion of this exercise and leverage a [cron-based action](https://github.com/cdransf/coryd.dev/blob/66085dfdb1fab7bd46b8aa3e4b5e40ced906fb93/.github/workflows/scheduled-post.yaml#L21):

{% raw %}

```yaml
name: Scheduled follow feed to Mastodon
on:
  schedule:
    - cron: '0 * * * *'
jobs:
  JSONFeed2Mastodon:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Feed to Mastodon
        uses: nhoizey/github-action-feed-to-mastodon@v2
        with:
          feedUrl: "https://coryd.dev/follow.json"
          mastodonInstance: "https://social.lol"
          mastodonToken: ${{ secrets.MASTODON_TOKEN }}
          testMode: true
      - name: Pull any changes from Git
        run: git pull
      - name: Commit and push
        uses: stefanzweifel/git-auto-commit-action@v4
```

{% endraw %}

GitHub will now check the `follow.json` feed and post updates hourly.

[^1]: This is also the part where I should make the time to try and add support for this and contribute the change.
[^2]: The JSON Feed site [provides a validator](https://validator.jsonfeed.org/) and this feed validates, but I'm returning an empty `content_html` field to satisfy their schema. This is in large part because returning properly sanitized and formatted html inside a string got messier than I would have liked and is not strictly necessary for my purposes here.
