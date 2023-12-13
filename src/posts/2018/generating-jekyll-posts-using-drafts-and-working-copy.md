---
date: '2018-04-22'
title: 'Generating Jekyll posts using Drafts and Working Copy'
description: "I put together a script that will take a draft, grab the title and body and then prompt you for front matter data before sending the completed post off to Working Copy. It's specific to my site, and purposes, but it should be fairly straightforward and easy to adapt to your needs."
draft: false
tags: ['iOS', 'JavaScript', 'automation']
---

I put together a script that will take a draft, grab the title and body and then prompt you for front matter data before sending the completed post off to [Working Copy](https://itunes.apple.com/us/app/id896694807?at=11lvuD). It's specific to my site, and purposes, but [it should be fairly straightforward and easy to adapt to your needs.](https://actions.getdrafts.com/a/1GO)<!-- excerpt -->

When you first run the action, it'll ask you for your repo name, posts path and Working Copy x-callback-url token. This info will be stored in [Drafts](https://itunes.apple.com/us/app/id1236254471?at=11lvuD) and used to write out the correct file.

Site categories and tags are expected to be space delimited and are split out and mapped over to parse them into the proper format.

Post dates are pre-populated with the current date and that same date is combined with the draft file to generate the file name that's specified when first running the action.
