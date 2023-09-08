---
layout: default
title: Tags
meta:
  site:
    name: 'Cory Dransfeldt'
    description: "I'm a software developer in Camarillo, California. I enjoy hanging out with my beautiful family and 4 rescue dogs, technology, automation, music, writing, reading and tv and movies."
    url: https://coryd.dev
    logo:
      src: https://coryd.dev/assets/img/logo.webp
      width: 2000
      height: 2000
  language: en-US
  title: 'Cory Dransfeldt • Tags'
  description: 'Browse all of my posts by tag.'
  url: https://coryd.dev/tags
  image:
    src: https://coryd.dev/assets/img/avatar.webp
---
{% for tag in collections.tagList %}
<span>
  <a href="/tags/{{ tag }}" class="!no-underline">
    <button class="tag--button">
      {{ tag }}
    </button>
  </a>
</span>
{% endfor %}
