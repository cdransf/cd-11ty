---
date: 2014-09-08
draft: false
title: Fastmail in Fluid.app
tags: ['Email', 'Fastmail']
---

I've spent the last few months bouncing around OSX mail clients. I went from Mail.app to [Airmail](https://itunes.apple.com/us/app/id573171375?at=11lvuD), to a [Mailmate](http://freron.com) trial, back to Airmail and then back to Mail.app. Now, however, I've finally settled on a mail client: [Fastmail](https://www.fastmail.com/?STKI=11917049)'s web interface in a [Fluid](http://fluidapp.com) instance.<!-- excerpt -->

I've gone with the Fastmail web app for one simple reason: I wanted every mail client I tried to essentially be a native version of their web app. I would find myself working in Fastmail's web app rather than any given mail client I was trying out without even thinking about it. I would be viewing something in Safari and then jump to the web app — rather than a mail client — without even thinking about it.

Running Fastmail in a Fluid instance did, however, require a bit of setup. First, I set my newly created Fastmail.app up as my default mail client. Next, I modified the default Gmail URL handler created with the new Fluid instance to open mailto: links in Fastmail as follows:

```javascript
function transform(inURLString) {
  inURLString = inURLString.replace('mailto:', '')
  inURLString = inURLString.replace('&', '&')

  var argStr = ''
  var splits = inURLString.split('?')

  var emailAddr = null
  var args = {}
  if (splits.length > 0) emailAddr = splits[0]
  if (splits.length > 1) argStr = splits[1]

  var outURLString = 'https://www.fastmail.com/mail/compose:to=' + emailAddr

  if (argStr.length > 0) outURLString += '&' + argStr
  return outURLString
}
```

Add this URL handler by going to the Fluid app's preferences, URL handlers and name the handler Fastmail with the pattern mailto:\*

Configuring the dock counter for the Fluid instance is also fairly straightforward and James Wilcox has [a great writeup on setting that up](http://jamesw.me/?p=347).

Are you currently using Fastmail in a Fluid instance? Or do you have a particular web client you prefer? I'm currently pretty happy with this setup and already have a few other ideas for URL handlers and scripts I plan on trying out.

If you don't use Fastmail, I would highly recommend it, and you can [sign up for it here](http://www.fastmail.com/?STKI=11917049).

**Edit (10.29.2014):** Updated the script to reflect Fastmail's new TLD (.com as opposed to .fm that they previously used; thanks to [Keith Bradnam for the heads-up](http://keithbradnam.com).

**Edit (1.29.2017):** Updated the compose URL to reflect Fastmail's new compose routing. Thanks, [Fred Barker](http://fredbarker.com)!
