---
date: '2017-08-13'
draft: false
title: Updating to the latest version of git on Ubuntu
tags: ['development', 'Git', 'Linux', 'Ubuntu']
---

If you're using git on Ubuntu, the version distributed via apt may not be the newest version of git (I use git to deploy changes on all the sites I manage).<!-- excerpt --> You can install the latest stable version of git provided by the maintainers as follows:

```bash
sudo add-apt-repository ppa:git-core/ppa
sudo apt-get update
```
