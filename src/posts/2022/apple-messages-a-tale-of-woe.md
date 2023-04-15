---
title: 'Apple Messages: a tale of woe OR how to fix sync, a crash loop and accept data loss'
date: '2022-04-06'
draft: false
tags: ['Apple', 'services']
---

Apple's Messages app recently started crashing in a loop on my Mac Mini — it would happen every time the app was opened after a 5-10 second delay. Deleting conversations from other devices and letting that change sync over didn't appear to help.<!-- excerpt -->

If you're attached to your message history and have a device where Messages.app isn't crashing, I'd suggest backing up your messages before you try fixing this. Done? Here we go:

Navigate to `~/Library` and delete:

```plaintext
Messages
Caches/com.apple.Messages
Caches/com.apple.imfoundation.IMRemoteURLConnectionAgent
Caches/com.apple.MobileSMS
Containers/com.apple.iChat
Containers/com.apple.soagent
```

Log out of/deactivate iMessage on all of your devices. Reboot them. Log back in and hope for the best[^1].

[^1]: They should start syncing again, but it may take a while and the conversations downloaded from iCloud may be a bit disjointed, but the app should stop crashing and work going forward.
