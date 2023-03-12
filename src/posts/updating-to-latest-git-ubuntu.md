---
title: Updating to the latest version of git on Ubuntu
date: '2017-08-13'
draft: false
tags: ['development', 'git', 'linux', 'ubuntu']
summary: If you're using git on Ubuntu, the version distributed via apt may not be the newest version of git (I use git to deploy changes on all of the sites I manage).
---

If you're using git on Ubuntu, the version distributed via apt may not be the newest version of git (I use git to deploy changes on all of the sites I manage).<!-- excerpt --> You can install the latest stable version of git provided by the maintainers as follows:

```
sudo add-apt-repository ppa:git-core/ppa
sudo apt-get update
```
