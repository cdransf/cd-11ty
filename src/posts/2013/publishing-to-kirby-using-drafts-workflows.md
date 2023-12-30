---
date: '2013-08-20'
title: 'Publishing to Kirby using Drafts workflows'
description: "I have recently begun publishing content to my Kirby powered site using workflows from the endlessly-customizable Drafts."
draft: false
tags: ['iOS']
---

I have recently begun publishing content to my [Kirby](http://getkirby.com) powered site using workflows from the endlessly-customizable [Drafts](http://agiletortoise.com/).<!-- excerpt --> The workflows I use send text formatted for my site's notes / blog template to [Textastic](http://www.textasticapp.com/). I then place the resulting text file in a folder named for the URL I want to assign to the post and push the folder to the appropriate content directory on my site.

My notes template uses four different text file names to differentiate between published content types and I have created a Drafts workflow for each name.

**Text post workflow:**

```text
'textastic://x-callback-url/new?name=note.text.txt&amp;text=Title:%20[[title]]%0D----%0DDate:%20[[date|%m.%d.%Y]]%0D----%0DText:%20[[body]]'
```

So, for example, if the following were placed in to a draft ...

_Lorem ipsum dolor sit amet_

_Consectetur adipiscing elit. Suspendisse imperdiet ullamcorper accumsan. Duis et rhoncus odio. Vestibulum rhoncus nisl diam, non malesuada odio condimentum in. Morbi ut nisi nec erat viverra blandit at dapibus nibh._

... the workflow above would create a text file in Textastic named note.text.txt that contains:

```markdown
Title: Lorem ipsum dolor sit amet
----
Date: 08.20.2013
----
Text: Consectetur adipiscing elit. Suspendisse imperdiet ullamcorper accumsan. Duis et rhoncus odio. Vestibulum rhoncus nisl diam, non malesuada odio condimentum in. Morbi ut nisi nec erat viverra blandit at dapibus nibh.
```

**Link post workflow:**

This would output the following ...

_Lorem ipsum dolor sit amet_

_Consectetur adipiscing elit. Suspendisse imperdiet ullamcorper accumsan. Duis et rhoncus odio. Vestibulum rhoncus nisl diam, non malesuada odio condimentum in. Morbi ut nisi nec erat viverra blandit at dapibus bibh._

... as:

```markdown
Title: Lorem ipsum dolor sit amet
----
Date: 08.20.2013
----
Link: https://google.com
----
Text: Consectetur adipiscing elit. Suspendisse imperdiet ullamcorper accumsan. Duis et rhoncus odio. Vestibulum rhoncus nisl diam, non malesuada odio condimentum in. Morbi ut nisi nec erat viverra blandit at dapibus nibh.
```

It's worth noting that this particular workflow is a bit messy inasmuch as I've included an arbitrary number of Drafts line tags to account for any additional paragraphs of text after the first. Using the [[body]] tag in this instance would result in the "Link: <http://google.com>" line being included with the text.

The final two post types / work flows I use are identical to the first aside from the name of the file they supply to Textastic. They are as follows:

**Image post workflow:**

```text
'textastic://x-callback-url/new?name=note.image.txt&amp;text=Title:%20[[title]]%0D----%0DWhen:%20[[date|%m.%d.%Y]]%0D----%0DText:%20[[body]]'
```

**Gallery post workflow:**

```text
textastic://x-callback-url/new?name=note.gallery.txt&amp;text=Title:%20[[title]]%0D----%0DWhen:%20[[date|%m.%d.%Y]]%0D----%0DText:%20[[body]]
```

Using these actions to publish content from Drafts to your Kirby-based site should be as simple as changing the file name sent to Textastic in each workflow. If you run in to any problems or have any suggestions for improving these workflows feel free to [let me know](mailto:hi@coryd.dev).

Many thanks to [Alex Duner](http://alexduner.com/) and [Nate Boateng](http://rantsandrambles.net/) for the Statamic Drafts workflow they provided to get me pointed in the right direction on this.
