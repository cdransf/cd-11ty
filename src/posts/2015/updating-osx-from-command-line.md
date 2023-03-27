---
date: 2015-09-05
draft: false
title: Update OS X from the command line
tags: ['macOS']
---

If you don't want to bother dealing with the Mac App Store you can check for any recent updates for OS X from the command:

```bash
sudo softwareupdate -i -a
```

<!-- excerpt -->

You can also combine this with commands to run Homebrew and Cask updates (allowing you to quickly update things quickly and efficiently):

```bash
sudo softwareupdate -i -a && brew update && brew upgrade brew-cask && brew cleanup && brew cask cleanup
```
