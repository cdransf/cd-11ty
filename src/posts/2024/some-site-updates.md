---
date: '2024-04-29T09:16-08:00'
title: 'Some site updates'
description: ''
tags: ['development', 'CSS', 'javascript']
---
I updated some things on my site and then I started to lose track of all of said updates.<!-- excerpt -->

### Menu

I added a proper mobile menu: it's all written in CSS and [leverages a hidden checkbox input to maintain the menu state](https://github.com/cdransf/coryd.dev/blob/fb7445336359015871de0ac4c3d3cef5743713c7/src/_includes/partials/nav/menu.liquid).

The [CSS is a bit verbose](https://github.com/cdransf/coryd.dev/blob/fb7445336359015871de0ac4c3d3cef5743713c7/src/assets/styles/components/menu.css) and flips my preferred `min-width` media query targeting to `max-width`.

I typically avoid using ids for styling, but I'm wrapping the click targets in a `label` associated with the input to allow the `:checked` and `:not(:checked)` styles to be applied on click. I've also added styling to display a handful of the menu items on desktop as icons while swapping them for links/labels in the mobile menu.

### Books

I'm self-hosting my reading data — I've found I don't use many of the features by the popular book-tracking services. Instead, I'm using [Katy Decorah](https://katydecorah.com)'s [read-action](https://github.com/katydecorah/read-action) GitHub action.

I built out a [books page](/books) to display what I'm reading currently and a running list of [books I want to read](/books/want-to-read).

I'm using the ISBN to link out to [Open Library](https://openlibrary.org) rather than Google Books (where the data is fetched from).

### Home page

I updated my home page to include a list of featured posts. This is populated from my posts collection by filtering for any posts where I've added `featured: true` to the frontmatter and selecting the newest three posts.

The recent posts section below contains my five newest posts. The full list of posts starts on a "new" [posts](/posts) page.

I removed the repetitive `Read more` links as the title of each post already linked to the post.

### Links page

I tweaked the design of my links page. Instead of a list, each link is rendered in a box placed in a grid — each box has a share button and the tags I've applied to the link. These tags link to pages that intermingle posts I've written alongside links on the same topic.

### Now page

I added a timestamp to the very bottom of my now page indicating when it was last updated (typially at least once an hour).

### Design

I changed the typeface I'm using to [MonoLisa](https://www.monolisa.dev), which I also use in [Sublime Text](https://www.sublimetext.com) and Terminal.app, with the letter and word spacing tightened up slightly from the default. Links within paragraphs are underlined to stand out and the base spacing value I use for — well, most things – has been increased. I dropped rounded corners for (most) of my images, form inputs and scrollbar styles.

### Image loading

I moved my site images to a B2 bucket and have started leveraging Netlify's image CDN for cropping, sizing and setting formats (so that I don't need to duplicate images in different formats). I have the B2 bucket mounted as a network share using [Mountain Duck](https://mountainduck.io) — when I add a new album cover or artist image for my Plex music display, [Hazel](https://www.noodlesoft.com) watches the folder where I store them, normalizes the file name and copies them to the appropriate directory.

### Music data

In the interest of being somewhat lazy, I wrote node scripts to traverse the music folders I have stored with Plex and use the name of each folder to prepopulate artist and album metadata objects. These objects store the image, genre and [MusicBrainz](https://musicbrainz.org) ID associated with each artist and the image and genre for each album. The MusicBrainz ID allows me to link out to the artist or release.

---

I *think* that covers everything but I'm likely wrong.