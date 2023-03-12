---
layout: default
pagination:
    data: collections
    size: 1
    alias: tag
permalink: /tags/{{ tag }}/
eleventyComputed:
    title: '{{ tag }}'
---

{% for post in collections[tag] %}

<div class="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
    <a class="no-underline" href="{{ post.url }}"
        ><h2
            class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl"
        >
            {{ post.data.title }}
        </h2>
    </a>
    <div class="mt-2 text-sm">
        <em>{{ post.date | date: "%m.%d.%Y" }}</em>
    </div>
    <p class="mt-4">{{ post.data.post_excerpt }}
    </p>
    <div class="mt-4 flex items-center justify-between">
        <a class="flex-none font-normal no-underline" href="{{ post.url }}">Read more &rarr;</a>
    </div>
</div>
{% endfor %}
