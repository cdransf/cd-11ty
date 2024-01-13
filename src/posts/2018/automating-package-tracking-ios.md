---
date: '2018-01-09'
title: 'Automating package tracking on iOS'
description: 'I try to do as much shopping as I can online and a lot of the shopping I end up doing is through Amazon. This means I end up with quite a few order and shipping confirmation emails in my inbox.'
tags: ['automation', 'iOS']
---

I try to do as much shopping as I can online and a lot of the shopping I end up doing is through Amazon. This means I end up with quite a few order and shipping confirmation emails in my inbox.<!-- excerpt -->

In an effort to cut down on manually managing and tracking all of these, I've begun maintaining a rule to auto-forward all emails I receive with tracking information to Junecloud's web service that backs their Deliveries[^1] app.

In Gmail/Google apps, the rule syntax looks like the following:

```text
subject:("SHIPPING EMAIL SUBJECT") OR subject:("SHIPPING EMAIL SUBJECT")
```

Emails matching that rule are then sent to <track@junecloud.com> and, provided the sending address matches the email associated with your Junecloud account, your packages will be automatically added to the Deliveries app. Now all of my deliveries are automatically tracked where they normally would be, without adding to the clutter in my inbox or my email workload.

[^1]: Deliveries is available on [iOS](https://itunes.apple.com/us/app/deliveries-a-package-tracker/id290986013) and [macOS](https://itunes.apple.com/us/app/deliveries-a-package-tracker/id924726344)
