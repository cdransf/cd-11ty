---
title: Tags
layout: default
permalink: /tags.html
---
{% for tag in collections.tagList %}
<span>
  <a href="/tags/{{ tag }}" class="!no-underline">
    <button class="pill--button">
      {{ tag }}
    </button>
  </a>
</span>
{% endfor %}
