---
date: '2016-12-11'
title: 'Throwing together a blog'
description: "I've been working on this site for longer than I'd care to admit (years at this point). It's been through a few domains, two content management systems, multiple versions of those content management systems, countless designs and several different hosts. I'm really happy with where it's at and what I've learned putting it together."
draft: false
tags: ['development', 'Statamic']
---

I've been working on this site for longer than I'd care to admit (years at this point). It's been through a few domains, two content management systems, multiple versions of those content management systems, countless designs and several different hosts. I'm really happy with where it's at and what I've learned putting it together.<!-- excerpt -->

I started this site off running [Kirby](https://getkirby.com) on shared hosting. It's served as a design and development playground for me as I've learned and applied new things. It started off without being version and now the source for it is stored on [GitHub](https://github.com) and now runs on [Statamic](https://statamic.com).

I started off writing the CSS and JS for the site
manually, before generating a Grunt build process, breaking out the styles to be more modular and rewriting them in SCSS. Dependencies are now sourced from [npm](http://npmjs.com) and [Bower](https://bower.io).

Instead of running the site on shared hosting, it now runs on a LAMP [Digital Ocean](https://m.do.co/c/3635bf99aee2) box using PHP7 and [mod_pagespeed](https://github.com/pagespeed/mod_pagespeed), both of which have made a tremendous difference in terms of site performance.

As it stands now, I'm thrilled with where this site sits, but I'm curious to see how else I can continue improving it.
