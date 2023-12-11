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
<div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
  <a class="!no-underline" href="{{ post.url }}">
    <h2
      class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl"
    >
      {{ post.data.title }}
    </h2>
  </a>
  <div class="my-2 text-sm">
    <time class="dt-published" datetime="{{ post.date }}">
      {{ post.date | date: "%m.%Y" }}
    </time>
  </div>
  {% if post.data.post_excerpt %}
  <p class="p-summary mt-0">{{ post.data.post_excerpt | markdown }}</p>
  {% endif %}
  <div class="mt-4 flex items-center justify-between">
    <a class="flex-none font-normal !no-underline" href="{{ post.url }}">Read more &rarr;</a>
  </div>
</div>
{% endfor %}
