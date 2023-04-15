---
date: 2014-04-30
draft: false
title: Sorting email using aliases and plus addressing in Fastmail
tags: ['Email', 'Fastmail']
---

I subscribe to a number of mailing lists and, up until recently, had been using individual server-side rules to sort all incoming messages from those lists in to a specific folder. However, as the number of lists I was subscribed to grew, adding and maintaining individual rules became increasingly tedious.<!-- excerpt -->

To make managing messages from mailing lists easier, I've switched all of the mailing lists I subscribe to to an alias that is targeted at the specific folder I want them sorted in to. To set this up you need to create a new alias and target that alias at a specific folder using [plus addressing](https://www.fastmail.com/help/receive/addressing.html) as follows:

`fastmailusername+targetfolder@fastmail.com`

Now, instead of having to create a rule for each mailing list sender, I simply provide the alias that I have created and any messages received via that alias are sent directly to the folder I store mailing list messages in.
