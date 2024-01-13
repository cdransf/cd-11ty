---
date: '2024-01-05'
title: 'I removed Tailwind from my site'
description: 'A brief run through removing Tailwind.css from this site.'
tags:
  - Eleventy
  - CSS
  - development
  - Tailwind
---
I chose the starting template for this site in part *because* it used Tailwind and I'm not confident in my ability to design much of anything from scratch. As of last week (or so), that's all been removed.<!-- excerpt -->

I still think Tailwind's a good tool and a fine choice under the right circumstances but, for a site like this (with exactly zero stakes), I don't think it's necessary. I wanted a bit more control, tidier markup, smaller output, less dependencies and one less build step.

My approach was this:

1. Remove `tailwind.css`
2. Add a new, blank `index.css`
3. Write `css` until I achieve approximate design transparency
4. Remove Tailwind dependencies
5. Revise build commands
6. Refactor and clean up

I kept Tailwind's core color ranges that I was leveraging prior to doing this, because I like the granularity and optionality that system affords and I've hewed tightly to the same basic design (because, again, not a designer here).

The styles output by Tailwind were about 2400 lines, my new `index.css` file is just over 500 lines. The index file contains broad, global styles and [I've gone ahead and split out a number of per page and per component styles into their own files](https://github.com/cdransf/coryd.dev/tree/main/src/assets/styles). These styles are loaded minified and inline on the relevant pages and with the required components.

I can't say I noticeably improved performance by making this change since, well, it was already a static site that did quite well by virtue of that. I am happy to have one less build step and one less dependency. I'm happy to be writing bog-standard CSS again and am enjoying all of the improvements to the language that had been obscured from my use by tools and pre-processors.

I also think that Tailwind still makes a lot of sense on larger sites, larger projects and teams where standardized approaches are important in a larger codebase. But, for a tiny site like this one, it's not needed, when I'm writing all the code and hewing to my own pattern (or lack thereof).