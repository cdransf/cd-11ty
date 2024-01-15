---
title: Blogroll
layout: default
permalink: /blogroll.html
image: /assets/img/ogi/blogroll.jpg
description: 'These are awesome blogs that I enjoy and you may enjoy too.'
---
<h2 class="page__header">{{ title }}</h2>
<ul class="link__list">
  {% for blog in blogroll %}
  <li>
    <a class="no-underline" href="{{blog.url}}">
      {{ blog.name }}
    </a>
  </li>
  {% endfor %}
</ul>
