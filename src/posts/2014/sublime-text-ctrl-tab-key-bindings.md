---
date: 2014-08-06
draft: false
title: Sublime Text 3 - ctrl + tab key bindings
tags: ['Sublime Text']
---

I use [Sublime Text](http://sublimetext.com) as my primary text editor but have never liked the default tab behavior where ctrl + tab takes you to the most recently used tab rather than the next horizontal tab in the tab bar (ctrl + shift + tab does the reverse).<!-- excerpt -->

To fix this, I've added a few lines to the user key bindings file (located in Preferences > Key Bindings - User):

```json
{ "keys": ["ctrl+tab"], "command": "next_view" },
{ "keys": ["ctrl+shift+tab"], "command": "prev_view" }
```
