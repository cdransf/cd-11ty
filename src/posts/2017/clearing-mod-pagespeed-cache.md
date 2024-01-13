---
date: '2017-02-20'
title: 'Clearing mod_pagespeed cache'
description: "I use mod_pagespeed on this server to help speed up asset delivery and force optimization best practices across all the sites I host."
tags: ['Apache', 'development']
---

I use [mod_pagespeed](https://github.com/pagespeed/mod_pagespeed) on this server to help speed up asset delivery and force optimization best practices across all the sites I host.<!-- excerpt --> Occasionally, during deployments, it's helpful to clear the module cache. Doing so is as simple as the following:

```bash
touch /var/cache/mod_pagespeed/cache.flush
```
