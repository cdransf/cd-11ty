---
date: '2023-06-08'
title: 'From ICS to JSON: surfacing anticipated albums'
draft: false
tags: ['development', 'music', 'automation']
image: https://cdn.coryd.dev/blog/album-releases.jpg
---

I use MusicHarbor by [Marcos Tanaka](https://marcosatanaka.com) to track upcoming albums from my favorite artists (typically by syncing [my last.fm data](https://www.last.fm/user/cdme_) with the app.) When I see something new that I want to add to my collection I throw it on a calendar creatively titled `Albums`.<!-- excerpt -->

My calendar sits over at <a href="https://pr.tn/ref/X775YX40Z50G" onclick="va('event',{name:'Proton referral',data:{location:'Referrals'}})">Proton</a> which lets you share calendars with other users or as a syncable/downloadable `ics` file. As another entry into a list of experiments done because they can be I decided to surface these album events on [my now page](https://coryd.dev/now)[^1].

To do this I installed `ics-to-json-extended` and created a data file:

```javascript
const { AssetCache } = require('@11ty/eleventy-fetch')
const ics = require('ics-to-json-extended')
const { DateTime } = require('luxon')

module.exports = async function () {
const URL = process.env.SECRET_FEED_ALBUM_RELEASES
const icsToJson = ics.default
const asset = new AssetCache('album_release_data')
if (asset.isCacheValid('1h')) return await asset.getCachedValue()
const icsRes = await fetch(URL)
const icsData = await icsRes.text()
const data = icsToJson(icsData)
return data.filter((d) => DateTime.fromISO(d.startDate) > DateTime.now())
}
```

We surface the url, require the ICS conversion library, cache and convert the response using [Luxon](https://www.npmjs.com/package/luxon)'s `DateTime` interface to compare the current time and dates in the object returned from the calendar, which look like this:

```json
{
  startDate: '20180505T020000Z',
  endDate: '20180505T060000Z',
  location: 'url',
  summary: 'Artist - Album'
}
```

Rendering the output is as simple as:
{% raw %}

```liquid
{% if albumReleases.size > 0 %}
  <h2 class="m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    {% heroicon "solid" "calendar" "Albums I'm looking forward to" "height=28" %}
    <div class="ml-1">Albums I'm looking forward to</div>
  </h2>
  <ul class="list-inside list-disc pl-5 md:pl-10">
    {% for album in albumReleases %}
      <li class="mt-1.5 mb-2">
        <span class="font-bold">{{ album.startDate | readableDate }}: </span>
        <a href="https://{{album.location}}" title="{{album.summary | escape}}">
          {{album.summary}}
        </a>
      </li>
    {% endfor %}
  </ul>
{% endif %}
```

{% endraw %}
Leaving us with:
{% image '<https://cdn.coryd.dev/blog/album-releases.jpg>', 'Albums I\'m looking forward to', 'w-full', '600px' %}

[^1]: At this point, a dev playground.
