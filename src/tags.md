---
layout: default
title: Tags
---

{% for tag in collections.tagList %}

<span>
    <a href="/tags/{{ tag }}" class="no-underline"><button class="font-semibold py-2 px-4 mr-6 mb-4 rounded-full text-white dark:text-gray-900 bg-primary-400 hover:bg-primary-500 dark:hover:bg-primary-300">
        {{ tag }}
    </button>
    </a>
</span>
{% endfor %}
