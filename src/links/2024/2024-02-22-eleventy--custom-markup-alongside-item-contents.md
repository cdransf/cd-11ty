---
title: "Eleventy: custom markup alongside item contents"
date: "2024-02-23T02:59-08:00"
tags: ["javascript", "development"]
description: "I’ve been working on something big that is scheduled to land on my blog soon and I encountered an interesting problem. I wanted to put a piece of HTML code in a selected place alongside the post content, preferably without client-side JavaScript. An hour later I arrived at a solution I deem good enough, but since it’s now living rent-free in my head and I’m a heartless landlord when it comes to my brain space, here goes. Setup A typical use case when this problem pops up involves putting intrusive ads between subsequent paragraphs of the article. This is typically achievable by embedding necessary JS code directly in the post content. Modern content management systems are usually smart enough to make it a non-issue. But I run Eleventy, a static site generator, and I have no content management system other than Markdown files, Git repository and a bunch of JavaScript code to make it all look and work like a modern website. My blog articles are rendered (or supposed to render) in various contexts: on the website, ..."
link: https://blog.lukaszwojcik.net/eleventy-custom-markup-alongside-item-contents/
---
