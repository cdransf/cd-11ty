---
title: About
layout: default
permalink: /about.html
---
{%- assign artist = music.week.artists | first -%}
{%- assign book = books | bookStatus: 'started' | reverse | first -%}
{%- assign show = tv | first -%}
<div class="avatar-wrapper flex-centered">
  <div class="interior">
  {%- capture about_alt -%}{{ meta.siteName }} - image by David Neal / @reverentgeek{%- endcapture -%}
  <img src="https://coryd.dev/.netlify/images/?url=/assets/img/default-transparent.png&w=600" alt="{{ about_alt }}" loading="eager" decoding="async" width="600" height="600" />
  </div>
</div>
<h2 class="page-header text-centered">Hi, I'm Cory</h2>

<strong class="highlight-text">I'm a software developer based in Camarillo, California</strong>. I enjoy hanging out with my beautiful family and 3 rescue dogs, technology, automation, [music](https://coryd.dev/now#artists), writing, [reading](https://coryd.dev/now#books), [tv](https://coryd.dev/now#tv) and [movies](https://coryd.dev/now#movies). Lately I've been listening to a lot of <strong class="highlight-text">{{ artist.title }}</strong>, reading <strong class="highlight-text">{{ book.title }}</strong> and watching <strong class="highlight-text">{{ show.name }}</strong>.

I build, maintain and design web applications. I've been coding professionally since 2010 with a focus on frontend technologies. I help organize [the Eleventy Meetup](https://11tymeetup.dev) and mentor through [Underdog Devs](https://www.underdogdevs.org).

I tend to write about whatever strikes me, with a focus on development, technology, automation or issues I run into with these things. This is all typically light on editing with and heavy on spur of the moment thoughts.

[You can also see what I'm doing now](/now), [take a look at the links I've shared recently](/links) or [check out the webrings I'm a member of](/webrings).

{% render "partials/widgets/badge-grid.liquid" %}
