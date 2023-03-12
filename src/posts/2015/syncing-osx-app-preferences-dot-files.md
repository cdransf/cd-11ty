---
title: Syncing OSX app preferences and dot files
date: '2015-03-15'
draft: false
tags: ['development', 'macOS']
---

I've started using a command line tool called [mackup](https://github.com/lra/mackup) to back up and sync many of my dot files and application settings on OS X.<!-- excerpt -->

You can install the tool via [pip](https://pypi.python.org/pypi/pip) or [homebrew](http://brew.sh). I installed it via homebrew and set it up as follows:

```bash
brew install mackup
mackup backup
```

By default mackup will back up your files to a file named mackup in the root of your Dropbox folder. You can also choose to back your files up to Google Drive or anywhere else on your local drive by creating .mackup.cfg in your user root and setting [options the tool provides](https://github.com/lra/mackup/tree/master/doc).

Now, when you move to a new machine, you simply install the tool and run:

```bash
mackup restore
```

Your settings will be added to the new machine and kept in sync via the storage you chose when setting up mackup.
