---
title: About
layout: page
permalink: /about.html
---
{%- assign artist = music.week.artists | first -%}
{%- assign book = books.all | bookStatus: 'started' | reverse | first -%}
{%- assign show = tv.recentlyWatched | first -%}
<div class="avatar-wrapper">
  <div class="interior">
    {%- capture about_alt -%}{{ globals.site_name }} - image by @joel@fosstodon.org{%- endcapture -%}
    <img
      srcset="
        https://cdn.coryd.dev/{{ globals.about }}?class=squaresm&type=webp 200w,
        https://cdn.coryd.dev/{{ globals.about }}?class=squaremd&type=webp 400w,
        https://cdn.coryd.dev/{{ globals.about }}?class=squarebase&type=webp 800w
      "
      sizes="(max-width: 450px) 200px, (max-width: 850px) 400px, 800px"
      src="https://cdn.coryd.dev/{{ globals.about }}?class=squaresm&type=webp"
      alt="{{ about_alt }}"
      loading="eager"
      decoding="async"
      width="200"
      height="200"
    />
  </div>
</div>
<h2 class="about-title">Hi, I'm Cory</h2>

<strong class="highlight-text">I'm a software developer based in Camarillo, California</strong>. I enjoy hanging out with my beautiful family and 3 rescue dogs, technology, automation, [music](https://coryd.dev/music), [writing](https://coryd.dev/posts), [reading](https://coryd.dev/books), [tv](https://coryd.dev/watching#tv) and [movies](https://coryd.dev/watching#movies). Lately I've been listening to a lot of <strong class="highlight-text">{{ artist.title }}</strong>, reading <strong class="highlight-text">{{ book.title }}</strong> and watching <strong class="highlight-text">{{ show.name }}</strong>.

I build, maintain and design web applications. I've been coding professionally since 2010 with a focus on frontend technologies. I also mentor through [Underdog Devs](https://www.underdogdevs.org).

I tend to write about whatever strikes me, with a focus on development, technology, automation or issues I run into with these things. This is all typically light on editing with and heavy on spur of the moment thoughts.

[You can also see what I'm doing now](/now), [take a look at the links I've shared recently](/links) or [check out the webrings I'm a member of](/webrings).

{% render "partials/blocks/badge-grid.liquid", badges: badges %}
