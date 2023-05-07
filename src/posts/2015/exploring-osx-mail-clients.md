---
date: 2015-04-17
draft: false
title: Exploring OS X mail clients
tags: ['Fastmail', 'Email']
---

I've been using [Fastmail](https://www.fastmail.com/?STKI=11917049) for over a year now and have been exploring email clients the entire time I've been a subscriber. Until recently, the best client I've been able to find has been Fastmail's web app itself (whether that's in the browser or [in a Fluid instance](http://coryd.me/notes/fastmail-in-fluid-app).<!-- excerpt -->

I've tried [Airmail](http://airmailapp.com/), which is fine but isn't as flexible as I'd like (despite having a really extensive preferences pane) or as lightweight as I had hoped[^1]. I suffered through using OS X's Mail app and, though the [Gmailinator](https://github.com/nompute/GMailinator) plugin made it somewhat bearable, it frequently exhibited odd behavior that had me wondering just what the app was doing at times. I tried using [Mailmate](http://freron.com) on several occasions but would get hung up on the minimal nature of the app's designed and overwhelmed by its flexibility and feature-set.

I circled back to the Fastmail web app, but didn't love the idea of using a different web app for each of my email accounts (I have secondary Gmail accounts and would prefer a unified interface for all of my accounts). Frustration with using multiple web apps led me to give Mailmate another chance[^2].

I downloaded Mailmate and settled in to the idea of giving it a long term trial. I enabled the app's support for Gmail keybindings and went to work modifying the app's badge settings and creating custom folders I might find useful. I created a smart folder for tasks and assigned it to a dock and menubar counter[^3]. The tasks folder I created looks for emails from task management systems and messages I manually apply a todo label to (this isn't mapped to an IMAP label or folder — I don't typically handle tasks on the go and don't feel the need to reference this folder on the go).

I created several other helpful folders:

- A folder that lists all git commit messages for projects I'm working on.
- A folder that collects development meetup messages in Los Angeles so that I can decide which, if any, I'd like to attend.
- Individual folders for my Fastmail accounts so that I can filter through my inbox based on which alias a message was sent to.

Once I had folders set up in Mailmate, adjusted to the UI and began to memorize keyboard shortcuts, I was sold. The app is extremely lightweight and responsive, it's endlessly configurable and the app's bundles feature is extremely useful. I also really enjoy its composer view and Markdown support (being able to email fenced code blocks is extremely useful). I think I'm finally done looking for a new email app. Finally.

[^1]: In fairness, this is a subjective judgement, but the app doesn't feel quite as smooth or as responsive as I had hoped it would.
[^2]: This decision was, in part, prompted by [Gabe Weatherhead's](http://www.macdrifter.com/tag/mailmate.html) and Brett Terpstra's posts about the app. I assumed there must be slmething I was missing.
[^3]: I know, I know, I shouldn't be using email as a task management or todo system, but I find it helpful to have a running tally of messages I need to act on.
