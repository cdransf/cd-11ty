---
date: '2023-02-09'
title: 'Adding client-side rendered webmentions to my blog'
description: "My blog is currently hosted on weblog.lol which allows for a simple and configurable weblog managed in git with posts formatted in markdown."
tags: ['webmentions', 'development', 'JavaScript', 'API']
---

My blog is currently hosted on weblog.lol which allows for a simple and configurable weblog managed in git with posts formatted in markdown. I wanted to add webmentions to my blog which, as of now, doesn't include a build step. To accomplish this, I've added an intermediary api endpoint to the same Next.js app that powers my [/now](https://coryd.dev/now) page.<!-- excerpt -->

Robb has [a handy write-up on adding webmentions to your website](https://rknight.me/adding-webmentions-to-your-site/), which I followed — first adding the appropriate Mastodon link to my blog template, registering for webmentions.io and Bridgy, then adding the appropriate tags to my template document's `<head>` to record mentions.

Next it was simply a question of rendering the output from the webmentions endpoint.

My Next.js api looks like this:

```typescript
export default async function handler(req: any, res: any) {
  const KEY_CORYD = process.env.API_KEY_WEBMENTIONS_CORYD_DEV
  const KEY_BLOG = process.env.API_KEY_WEBMENTIONS_BLOG_CORYD_DEV
  const DOMAIN = req.query.domain
  const TARGET = req.query.target
  const data = await fetch(
    `https://webmention.io/api/mentions.jf2?token=${DOMAIN === 'coryd.dev' ? KEY_CORYD : KEY_BLOG}${
      TARGET ? `&target=${TARGET}` : ''
    }&per-page=1000`
  ).then((response) => response.json())
  res.json(data)
}
```

I have a pair of keys depending on the mentioned and provides domain, though this is only used on my blog at present. I also support passing through the `target` parameter but don't leverage it at the moment.

This is called on the client side as follows:

```javascript
document.addEventListener('DOMContentLoaded', (event) => {
  ;(function () {
    const formatDate = (date) => {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [month, day, year].join('-')
    }
    const webmentionsWrapper = document.getElementById('webmentions')
    const webmentionsLikesWrapper = document.getElementById('webmentions-likes-wrapper')
    const webmentionsBoostsWrapper = document.getElementById('webmentions-boosts-wrapper')
    const webmentionsCommentsWrapper = document.getElementById('webmentions-comments-wrapper')
    if (webmentionsWrapper && window) {
      try {
        fetch('https://utils.coryd.dev/api/webmentions?domain=blog.coryd.dev')
          .then((response) => response.json())
          .then((data) => {
            const mentions = data.children
            if (mentions.length === 0 || window.location.pathname === '/') {
              webmentionsWrapper.remove()
              return
            }

            let likes = ''
            let boosts = ''
            let comments = ''

            mentions.map((mention) => {
              if (
                mention['wm-property'] === 'like-of' &&
                mention['wm-target'].includes(window.location.href)
              ) {
                likes += `<a href="${mention.url}" rel="noopener noreferrer"><img class="avatar" src="${mention.author.photo}" alt="${mention.author.name}" /></a>`
              }

              if (
                mention['wm-property'] === 'repost-of' &&
                mention['wm-target'].includes(window.location.href)
              ) {
                boosts += `<a href="${mention.url}" rel="noopener noreferrer"><img class="avatar" src="${mention.author.photo}" alt="${mention.author.name}" /></a>`
              }

              if (
                mention['wm-property'] === 'in-reply-to' &&
                mention['wm-target'].includes(window.location.href)
              ) {
                comments += `<div class="webmention-comment"><a href="${
                  mention.url
                }" rel="noopener noreferrer"><div class="webmention-comment-top"><img class="avatar" src="${
                  mention.author.photo
                }" alt="${mention.author.name}" /><div class="time">${formatDate(
                  mention.published
                )}</div></div><div class="comment-body">${mention.content.text}</div></a></div>`
              }
            })

            webmentionsLikesWrapper.innerHTML = ''
            webmentionsLikesWrapper.insertAdjacentHTML('beforeEnd', likes)
            webmentionsBoostsWrapper.innerHTML = ''
            webmentionsBoostsWrapper.insertAdjacentHTML('beforeEnd', boosts)
            webmentionsCommentsWrapper.innerHTML = ''
            webmentionsCommentsWrapper.insertAdjacentHTML('beforeEnd', comments)
            webmentionsWrapper.style.opacity = 1

            if (likes === '') document.getElementById('webmentions-likes').innerHTML === ''
            if (boosts === '') document.getElementById('webmentions-boosts').innerHTML === ''
            if (comments === '') document.getElementById('webmentions-comments').innerHTML === ''

            if (likes === '' && boosts === '' && comments === '') webmentionsWrapper.remove()
          })
      } catch (e) {
        webmentionsWrapper.remove()
      }
    }
  })()
})
```

This JavaScript is all quite imperative — it verifies the existence of the appropriate DOM nodes, concatenates templated HTML strings and then injects them into the targeted DOM elements. If there aren't mentions of a supported type, the container node is removed. If there are no mentions, the whole node is removed.

The webmentions HTML shell is as follows:

```html
<div id="webmentions" class="background-purple container">
  <div id="webmentions-likes">
    <h2><i class="fa-solid fa-fw fa-star"></i> Likes</h2>
    <div id="webmentions-likes-wrapper"></div>
  </div>
  <div id="webmentions-boosts">
    <h2><i class="fa-solid fa-fw fa-rocket"></i> Boosts</h2>
    <div id="webmentions-boosts-wrapper"></div>
  </div>
  <div id="webmentions-comments">
    <h2><i class="fa-solid fa-fw fa-comment"></i> Comments</h2>
    <div id="webmentions-comments-wrapper"></div>
  </div>
</div>
```

And there you have it — webmentions loaded client side and updated as they occur. There's an example visible on my post [Automating (and probably over-engineering) my /now page](https://blog.coryd.dev/2023/02/automatingandprobablyoverengineeringmy-nowpage#webmentions).
