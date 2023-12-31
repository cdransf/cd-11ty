---
layout: default
pagination:
  data: collections
  size: 1
  alias: tag
permalink: /tags/{{ tag }}/
eleventyComputed:
  title: '{{ tag }}'
templateEngineOverride: liquid,md
---
{% assign posts = collections[tag] | reverse %}
{% for post in posts %}
<article class="h-entry">
  <a class="no-underline" href="{{ post.url }}">
    <h2 class="flex--centered">{{ post.data.title }}</h2>
  </a>
  <time class="dt-published" datetime="{{ post.date }}">
    {{ post.date | date: "%m.%Y" }}
  </time>
  {%- if post.data.post_excerpt %}
    <p class="p-summary">{{ post.data.post_excerpt | markdown }}</p>
  {% endif -%}
</article>
{% endfor %}
