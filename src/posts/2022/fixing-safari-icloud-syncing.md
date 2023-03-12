---
title: 'Fixing Safari iCloud syncing'
date: '2022-05-28'
draft: false
tags: [apple, ios, macos]
---

I've been having an intermittent issue with Safari failing to sync any data via iCloud that you would normally expect — history, tabs, bookmarks and the landing page were all behaving independently despite iCloud syncing being enabled.<!-- excerpt -->

These steps fixed the issue, finally, on my devices:

1. Open a terminal and run `defaults write com.apple.Safari IncludeInternalDebugMenu 1`
2. Quit Safari
3. Open Safari, navigate to the new `Debug` menu and select `Sync iCloud History`
4. Run `defaults write com.apple.Safari IncludeInternalDebugMenu 0` to disable the `Debug` menu[^1]
5. Disable Safari in the iCloud settings of each of your devices
6. Reboot each of your devices
7. Enable Safari in the iCloud settings of each of your devices

Cross your fingers and hope for the best, but sync should settle down and start working again. I'd contend that none of these steps _should_ be necessary, but here we are.

[^1]: Unless you want to keep it.
