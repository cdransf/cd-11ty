---
date: '2023-03-17'
title: 'Webmentions in Eleventy'
draft: false
tags: ['webmentions', '11ty', 'eleventy']
---

In the interest of continuing to repeat myself I'm writing, once again, about adding webmentions to a blog.<!-- excerpt -->[^1] To quote myself[^2]:

> To kick this off you'll need to log in and establish an account with [webmention.io](https://webmention.io) and [Bridgy](https://brid.gy). The former provides you with a pair of meta tags that collect webmentions, the latter connects your site to social media

> Once you've added the appropriate tags from webmention.io, connected your desired accounts to Bridgy and received some mentions on these sites, you should be able to access said mentions via their API.

I'm fetching data from [webmention.io](https://webmention.io) at build time in `/src/_data/webmentions.js`:

```javascript
const EleventyFetch = require('@11ty/eleventy-fetch')

module.exports = async function () {
    const KEY_CORYD = process.env.API_KEY_WEBMENTIONS_CORYD_DEV
    const url = `https://webmention.io/api/mentions.jf2?token=${KEY_CORYD}&per-page=1000`
    const res = EleventyFetch(url, {
        duration: '1h',
        type: 'json',
    })
    const webmentions = await res
    return {
        mentions: webmentions.children,
    }
}
```

I have cache duration set to `1h` and a scheduled build operating on approximately the same schedule that's handled by a [GitHub action](https://github.com/actions) leveraging [Vercel's CLI](https://vercel.com/docs/cli):

```yaml
name: Scheduled Vercel build
env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
    schedule:
        - cron: '0 * * * *'
jobs:
    cron:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Install Vercel CLI
              run: npm install --global vercel@latest
            - name: Pull Vercel Environment Information
              run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
            - name: Build Project Artifacts
              run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
            - name: Deploy Project Artifacts to Vercel
              run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

When the build runs, it renders any mentions of a given post via a [liquid.js](https://liquidjs.com/) template that looks like this:

```liquid
{% if webmentions %}
    <div class="border-t border-gray-200 mt-12 pt-14 dark:border-gray-700">
    {%
        # Assign our filtered webmentions to a named variable,
        # checking the size of each mention type using the
        # appropriate key before then iterating through and
        # displaying the returned data.
    %}
    {% assign mentions = webmentions.mentions | webmentionsByUrl: page.url %}
    {% if mentions['repost-of'].size > 0 %}
    <h2 class="text-lg md:text-xl font-black leading-tight dark:text-gray-200">Reposts</h2>
    <div class="flex flex-row items-center mt-4 mb-6">
        <ul class="ml-3 flex flex-row">
        {% for mention in mentions['repost-of'] %}
            <li class="-ml-3 inline">
                <a href={{mention.url}}>
                    <img
                        src={{mention.author.photo}}
                        alt={{mention.author.name}}
                        class="h-14 w-14 rounded-full border-4 border-white dark:border-gray-900 transition-all hover:border-primary-500 dark:hover:border-primary-300"
                        loading="lazy"
                    />
                </a>
            </li>
        {% endfor %}
        </ul>
    </div>
    {% endif %}
    {% if mentions['like-of'].size > 0 %}
    <h2 class="text-lg md:text-xl font-black leading-tight dark:text-gray-200">Likes</h2>
    <div class="flex flex-row items-center mt-4 mb-6">
        <ul class="ml-3 flex flex-row">
        {% for mention in mentions['like-of'] %}
            <li class="-ml-3 inline">
                <a href={{mention.url}}>
                    <img
                        src={{mention.author.photo}}
                        alt={{mention.author.name}}
                        class="h-14 w-14 rounded-full border-4 border-white dark:border-gray-900 transition-all hover:border-primary-500 dark:hover:border-primary-300"
                        loading="lazy"
                    />
                </a>
            </li>
        {% endfor %}
        </ul>
    </div>
    {% endif %}
    {% if mentions['in-reply-to'].size > 0 %}
    <h2 class="text-lg md:text-xl font-black leading-tight dark:text-gray-200">Comments</h2>
    <div class="mt-4 flex flex-col items-center not-prose">
        {% for mention in mentions['in-reply-to'] %}
        <div class="border-bottom flex flex-row items-center border-gray-100 pb-4 w-full">
            <a class="group flex flex-row space-between items-center" href={{mention.url}}>
                <img
                    src={{mention.author.photo}}
                    alt={{mention.author.name}}
                    class="h-14 w-14 rounded-full border-4 border-white dark:border-gray-900 transition-all group-hover:border-primary-500 dark:group-hover:border-primary-300"
                    loading="lazy"
                />
                <div class="ml-3">
                    <p class="text-sm group-hover:text-primary-500 dark:group-hover:text-primary-300">{{mention.content.text}}</p>
                    <p class="mt-1 text-xs group-hover:text-primary-500 dark:group-hover:text-primary-300">{{mention.published | isoDateOnly}}</p>
                </div>
            </a>
        </div>
        {% endfor %}
    </div>
    {% endif %}
    </div>
{% endif %}
```

This conditionally displays different mention types based on the available data after being passed through the `webmentionsByUrl` filter which I shamelessly lifted from [Robb](https://github.com/rknightuk/rknight.me/blob/8e2a5c5f886cae6c04add7893b8bf8a2d6295ddf/config/filters.js#L48-L84).

I would like to also send outbound webmentions, but have yet to find a clear way to do so. One option I've seen mentioned is [Telegraph](https://telegraph.p3k.io/), but it's API interface requires a network call per link mentioned (which isn't untenable, but parsing posts for links and making a call for each _feels_ suboptimal)[^3].

[^1]: I've done so in [Next.js](https://coryd.dev/posts/2023/client-side-webmentions-in-nextjs/) and entirely in Javascript for [weblog.lol](https://coryd.dev/posts/2023/adding-client-side-rendered-webmentions-to-my-blog/).
[^2]: Or, better yet, read [Robb's post on the subject](https://rknight.me/adding-webmentions-to-your-site/).
[^3]: I'm probably missing something here and [am happy to be told I'm wrong](https://social.lol/@cory).
