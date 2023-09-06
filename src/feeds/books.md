---
layout: null
permalink: /feeds/books
---
{% render "partials/feeds/content.liquid"
  permalink:'/feeds/books'
  title:'Books • Cory Dransfeldt'
  data:books
  updated:books[0].dateAdded
  site:site
  eleventy:eleventy
%}