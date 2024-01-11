---
title: Tags
description: "Filter and find posts on my site by tag."
layout: default
permalink: /tags.html
image: /assets/img/ogi/tags.jpg
---
{% for tag in collections.tagList %}
<span>
  <a href="/tags/{{ tag }}" class="no-underline">
    <button class="pill--button">
      {{ tag }}
    </button>
  </a>
</span>
{% endfor %}
