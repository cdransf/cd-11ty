---
title: About
layout: default
permalink: /about.html
---
{%- assign artist = music.week.artists | first -%}
{%- assign book = books | bookStatus: 'started' | reverse | first -%}
{%- assign show = tv.recentlyWatched | first -%}
<div class="avatar-wrapper flex-centered">
  <div class="interior">
  {%- capture about_alt -%}{{ meta.siteName }} - image by David Neal / @reverentgeek{%- endcapture -%}
  <img
    srcset="
      https://coryd.dev/.netlify/images/?url=/assets/img/avatar-transparent.png&fit=cover&w=200&h=200&fm=webp&q=40 200w,
      https://coryd.dev/.netlify/images/?url=/assets/img/avatar-transparent.png&fit=cover&w=400&h=400&fm=webp&q=40 400w,
      https://coryd.dev/.netlify/images/?url=/assets/img/avatar-transparent.png&fit=cover&w=800&h=800&fm=webp&q=40 800w,
      https://coryd.dev/.netlify/images/?url=/assets/img/avatar-transparent.png&fit=cover&w=1200&h=1200&fm=webp&q=40 1200w
    "
    sizes="(max-width: 450px) 200px,
      (max-width: 850px) 400px,
      (max-width: 1000px) 800px,
      1200px"
    src="https://coryd.dev/.netlify/images/?url=/assets/img/avatar-transparent.png&fit=cover&w=1200&h=1200&fm=webp&q=40"
    alt="{{ about_alt }}"
    loading="eager"
    decoding="async"
    width="600"
    height="600"
  />
  </div>
</div>
<h2 class="page-header text-centered">Hi, I'm Cory</h2>

<strong class="highlight-text">I'm a software developer based in Camarillo, California</strong>. I enjoy hanging out with my beautiful family and 3 rescue dogs, technology, automation, [music](https://coryd.dev/music), writing, [reading](https://coryd.dev/books), [tv](https://coryd.dev/watching#tv) and [movies](https://coryd.dev/watching#movies). Lately I've been listening to a lot of <strong class="highlight-text">{{ artist.title }}</strong>, reading <strong class="highlight-text">{{ book.title }}</strong> and watching <strong class="highlight-text">{{ show.name }}</strong>.

I build, maintain and design web applications. I've been coding professionally since 2010 with a focus on frontend technologies. I help organize [the Eleventy Meetup](https://11tymeetup.dev) and mentor through [Underdog Devs](https://www.underdogdevs.org).

I tend to write about whatever strikes me, with a focus on development, technology, automation or issues I run into with these things. This is all typically light on editing with and heavy on spur of the moment thoughts.

[You can also see what I'm doing now](/now), [take a look at the links I've shared recently](/links) or [check out the webrings I'm a member of](/webrings).

{% render "partials/widgets/badge-grid.liquid" %}
