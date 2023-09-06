---
layout: null
permalink: /feeds/follow
---
{% render "partials/feeds/content.liquid"
  permalink:'/feeds/follow'
  title:'Follow • Cory Dransfeldt'
  data:follow.posts
  updated:follow.posts[0].date_published
  site:site
  eleventy:eleventy
%}