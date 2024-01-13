---
date: '2016-04-24'
title: 'Scriptable Backups with Arq'
description: "I've been using Arq for my backups for several months now and have regular backups being pushed to both Amazon Cloud Drive and AWS. A big part of Arq's appeal is its flexibility, configurability and the wide array of backup destinations it supports. In short, it allows you to own and control your backups."
tags: ['Arq', 'backups']
---

I've been using Arq for my backups for several months now and have regular backups being pushed to both [Amazon Cloud Drive](https://www.amazon.com/clouddrive) and [AWS](https://aws.amazon.com). A big part of Arq's appeal is its flexibility, configurability and the wide array of backup destinations it supports. In short, it allows you to own and control your backups.<!-- excerpt -->

In addition to being a wonderfully designed app, Arq ships with a handy command line utility that lets you pause, resume and otherwise control your backups using simple commands named for the app. In order to use these commands, however, you need to include the executable in your shell's path variable.

To accomplish this, I symlinked the Arq executable in to usr/local/bin. If /usr/local/bin isn't in your path, you can add it by adding the following to your .bashrc, .bash_profile or what have you:

```bash
export PATH=$PATH:/usr/local/bin
```

Next, symlink the Arq executable:

```bash
sudo ln -s /Applications/Arq.app/Contents/MacOS/Arq /usr/local/bin/Arq
```

Next, open up a new shell and try the following:

```bash
Arq pause 60
Arq resume
```

Now you can easily control your backups from your CLI of choice or even script them from apps like [Alfred](https://www.alfredapp.com/) or [Control Plane](http://www.controlplaneapp.com/) (context-sensitive backups anyone?).
