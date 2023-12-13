---
date: '2014-02-03'
draft: false
title: 'Photo management with Dropbox and Hazel'
description: "I recently abandoned iPhoto as a means of storing, organizing and managing photos on OSX and deactivated the associated iCloud Photo Sharing feature running from iOS in to iPhoto via iCloud."
tags: ['automation', 'Dropbox', 'macOS']
---

I recently abandoned iPhoto as a means of storing, organizing and managing photos on OSX and deactivated the associated [iCloud Photo Sharing](http://www.apple.com/icloud/icloud-photo-sharing.html 'iCloud Photo Sharing') feature running from iOS in to iPhoto via iCloud.<!-- excerpt --> I have replaced my iPhoto-based workflow with one centered around [Dropbox](http://dropbox.com) (which I have subscribed to for some time). I have been asked about this workflow and what follows is a brief explanation of what was involved with setting it up:

I began by exporting my iPhoto library to a folder using [Phoshare](http://code.google.com/p/phoshare/)[^iphoto]. I then created a simple [Hazel](http://www.noodlesoft.com/hazel.php) rule to scan my iPhoto library for duplicate images or videos and discard them. Clearing duplicates from my iPhoto library saved me 6 GB in space which either speaks to how disorganized my library was to begin with or how bloated iPhoto managed to make it.

After clearing duplicate files I created another rule to rename all photos based on the date they were taken and what they were taken with before then organizing them in to a sub-folder based on that date. From there organization was simply a question of looking through each folder and appending an event title after the date the folder was named with.

Once all of the above rules were run on my Dropbox Photos directory I edited them to run on my [Dropbox Camera Uploads directory](https://www.dropbox.com/help/289/en 'How do I use Camera Upload?'). This allows me to upload photos via the iOS Dropbox app or import it directly from my camera and have Hazel auto-organize any content based on event date which I then label and move to a folder in the Photos folder named for the year in which the pictures were taken.

I now have more Dropbox space, an organized and easy to share photo library and a simple workflow for any and all photos I take (I take a lot).

This workflow allows me to keep all my photos (and all of my edited photos) unified across all devices that I use as well as the web. If I need to edit something I edit it in Photoshop and let Dropbox take care of making sure it’s everywhere I need it to be.

To view photos on the go, I use [Unbound](http://unboundapp.com 'Unbound') which allows me to quickly glance through and view images without having to store them directly on the device being used to view them.

I no longer have to wonder whether my photos made it to iPhoto on my MacBook Air through [iCloud Photo Sharing](http://www.apple.com/icloud/icloud-photo-sharing.html 'iCloud Photo Sharing') or any other device. Any photos I take on my phone are everywhere I need to be without having to worry because of Dropbox, as is the case with any photos I take with my camera (though the process of connecting that to a computer feels increasingly cumbersome).

I've seen more complex photo workflows than mine, but tend to prefer the simplicity of the default Dropbox app, a handful of rules and a little manual sorting. Now, I have all of my photos sorted and will have any other photos I take sorted going forward.

[You can download the rules I use here »](https://d.pr/m2tV 'Hazel rules for Dropbox Camera Uploads')

[^iphoto]: It's worth noting that Dropbox's app also allows you to pull your photos out of iPhoto's library file. If you import your photos this way, Dropbox attempts to sort them in to folders by date and iPhoto event. I found it easier to use Phoshare as it simply exports your photos in to a single folder, making it easier for Hazel to process them.
