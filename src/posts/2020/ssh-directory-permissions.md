---
title: .ssh directory permissions
date: '2020-11-09'
draft: false
tags: ['ssh', 'development']
---

I was recently setting up a new, always-on machine that I do occasional dev work.<!-- excerpt --> This dev work typically consists of routine maintenance and, a requirement of that, is sshing into and running software updates on manually managed servers (yes, manually managed[^1]).

I sync my `.ssh` configuration using [mackup](https://github.com/lra/mackup). However, while setting up and then using a key I received a warning that my configured `.ssh` directory permissions were too open. If you ever run into this, the solution is fairly simple[^2]:

```bash
chmod 700 ~/.ssh
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa
```

Try reconnecting using the key in question and the warning should be resolved.

[^1]: Think small-scale WordPress or one-off projects.
[^2]: Where `id_rsa` is your key name.
