---
date: '2023-11-15'
title: 'Hacking together a Tweekly.fm replacement'
draft: false
tags: ['Development', 'Eleventy', 'GitHub']
---

I mused the other day about wanting a replacement for [Tweekly.fm](https://tweekly.fm) which shut down due to Twitter's API changes and restrictions. In my case, the aim would be to make this compatible with Mastodon since that's where I've found myself spending the most time recently.<!-- excerpt -->

[My thinking was:](https://social.lol/@cory/111405292422675624)

> I could go for a <https://tweekly.fm> but for Mastodon. Cron task that pings Last.fm's API once a week and spits out a formatted string?

Given some time, that's basically where I've landed. I'm not great with GitHub actions by any means, but I've come up with this:

{% raw %}

```yaml
name: Fetch weekly artist charts
on:
  workflow_dispatch:
  schedule:
    - cron: '00 09 * * 5'
jobs:
  FetchArtistCharts:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout out this repo
        uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
      - name: Fetch charts
        run: |
          echo "CHART_DATA=$(curl 'https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=coryd_&api_key=${{ secrets.LASTFM_API_KEY }}&format=json')" >> "$GITHUB_ENV"
      - name: Update charts
        run: |
          echo "CHARTS=$(cat src/_data/json/weekly-artist-charts.json | jq -c --argjson jq_data "$CHART_DATA" '.charts += [$jq_data]')" >> "$GITHUB_ENV"
      - name: Write charts
        run: |
          echo $CHARTS > src/_data/json/weekly-artist-charts.json
      - name: Commit
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Update artist charts for the week.
          commit_user_name: cdransf
          commit_user_email: cory.dransfeldt@gmail.com
          commit_author: Cory Dransfeldt
```

{% endraw %}

I've added a Last.fm API key to my repository secrets and the action then uses that key to access Last.fm's `usergetweeklyartistchart` endpoint. The JSON returned by the endpoint is then merged with an existing JSON object read in from `src/_data/json/weekly-artist-charts.json` and it's shaped like this:

```json
{
  charts: [...]
}
```

That merged JSON object is then written back out to `src/_data/json/weekly-artist-charts.json` and committed. From there, we expose the cached JSON data:

```javascript
const chartData = require('./json/weekly-artist-charts.json')
const charts = chartData['charts']

module.exports = async function () {
  return charts.map((chart) => {
    const artists = chart['weeklyartistchart']['artist'].splice(0, 8)
    const date = parseInt(chart['weeklyartistchart']['@attr']['to']) * 1000
    let content = 'My top artists for the week: '
    artists.forEach((artist, index) => {
      content += `${artist['name']} @ ${artist['playcount']} play${
        parseInt(artist['playcount']) > 1 ? 's' : ''
      }`
      if (index !== artists.length - 1) content += ', '
    })
    content += ' #Music #LastFM'
    return {
      title: content,
      url: `https://coryd.dev/now?ts=${date}`,
      date: new Date(date),
      description: `My top artists as of ${
        new Date(date).toLocaleString().split(',')[0]
      }.<br/><br/>`,
    }
  })
}
```

This exposes an array of chart objects that can then be composed into an RSS feed[^1]:

{% raw %}

```liquid
---

layout: null
eleventyExcludeFromCollections: true
permalink: /feeds/weekly-artist-chart

---

{% render "partials/feeds/rss.liquid"
  permalink:"/feeds/weekly-artist-chart"
  title:"Weekly artist chart • Cory Dransfeldt"
  description:"The top 8 artists I've listened to this week."
  data:weeklyArtistChart
  updated:weeklyArtistChart[0].date
  site:site
%}
```

{% endraw %}

This purpose-built RSS feed is then included with my web activity/follow feed:

```javascript
module.exports = async function () {
  const { ActivityFeed } = await import('@11ty/eleventy-activity-feed')
  const feed = new ActivityFeed()
  feed.addSource('rss', '📝', 'https://coryd.dev/feeds/posts')
  feed.addSource('rss', '🎥', 'https://coryd.dev/feeds/movies')
  feed.addSource('rss', '📖', 'https://coryd.dev/feeds/books')
  feed.addSource('rss', '🔗', 'https://coryd.dev/feeds/links')
  feed.addSource('rss', '🎧', 'https://coryd.dev/feeds/weekly-artist-chart')
  const entries = feed.getEntries().catch()
  const res = await entries
  const activity = { posts: [] }
  res.forEach((entry) => {
    activity.posts.push({
      id: entry.url,
      title: entry.title,
      url: entry.url,
      description: entry.content,
      content_html: entry.content,
      date_published: entry.published,
    })
  })
  return activity
}
```

And, finally, with all of that in place, new weekly artist charts will be fetched from Last.fm's API every Friday (which is when the community says they're typically updated, based on some cursory research), fed into an RSS feed and exposed to the follow feed that gets syndicated to Mastodon.

[The output looks like this:](https://social.lol/@cory/111416515948114589)

> 🎧: My top artists for the week: Tom Waits @ 34 plays, blink-182 @ 19 plays, Aesop Rock @ 18 plays, Sedimentum @ 18 plays, Vertebra Atlantis @ 14 plays, Chaotian @ 13 plays, Hooded Menace @ 12 plays, Hot Mulligan @ 12 plays #Music #LastFM <https://coryd.dev/now?ts=1699963200000>

[^1]: The `?ts` parameter is used purely to create a unique link to be syndicated.
