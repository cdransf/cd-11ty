---
title: About
layout: default
permalink: /about.html
image: /assets/img/ogi/about.jpg
---
{% capture css %}
  {% render "../assets/styles/pages/about.css" %}
{% endcapture %}
<style>{{ css }}</style>
<div class="avatar__wrapper flex--centered">
  {% capture about_alt %}{{ meta.siteName }} - image by David Neal / @reverentgeek{% endcapture %}
  {% image './src/assets/img/avatar.webp', about_alt %}
</div>
<h2 class="page__header text-center">Hi, I'm Cory</h2>

I'm a software developer in Camarillo, California. I enjoy hanging out with my beautiful family and 4 rescue dogs, technology, automation, [music](https://last.fm/user/coryd_), writing, [reading](https://app.thestorygraph.com/profile/coryd), [tv](https://trakt.tv/users/cdransf) and [movies](https://trakt.tv/users/cdransf).

I build, maintain and design web applications. I've been coding professionally since 2010 with a focus on frontend technologies. I help organize [the Eleventy Meetup](https://11tymeetup.dev).

I tend to write about whatever strikes me, with a focus on development, technology, automation or issues I run into with these things. This is all typically light on editing with and heavy on spur of the moment thoughts.

[You can also see what I'm doing now](/now), [take a look at the links I've shared recently](/links) or [check out the webrings I'm a member of](/webrings).
