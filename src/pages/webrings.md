---
title: Webrings
layout: default
permalink: /webrings.html
description: "Webrings are awesome! These are the ones I'm a member of."
---
{% capture css %}
  {% render "../assets/styles/pages/webrings.css" %}
{% endcapture %}
<style>
  {{ css | cssmin }}
</style>
<h2
class="m-0 text-xl font-black leading-tight tracking-normal dark:text-white md:text-2xl mb-2"
>
{{ title }}
</h2>

[Webrings](https://en.wikipedia.org/wiki/Webring) are _awesome_. I'm a member of a few that follow. Check them out!

{% render "webrings/the-claw.liquid" %}
<hr />
{% render "webrings/css-joy.liquid" %}
