---
date: '2015-08-29'
title: 'Moving to Bitbucket'
description: "I recently moved all the repositories for my personal and client development projects to Bitbucket. I had been paying for GitHub's micro plan to manage a few projects that I didn't want public, but made the decision to switch after exploring a bit more and seeing that, well, Bitbucket provides the functionality I was paying GitHub for free."
tags: ['Git', 'GitHub', 'Bitbucket']
---

I recently moved all the repositories for my personal and client development projects to [Bitbucket](http://bitbucket.org).<!-- excerpt --> I had been paying for GitHub's micro plan to manage a few projects that I didn't want public, but made the decision to switch after exploring a bit more and seeing that, well, Bitbucket provides the functionality I was paying GitHub for free.

Making the switch itself was painless. I added a key to my Bitbucket account, switched the remotes out on my repos and pushed each repo to its new home on Bitbucket. Switching remotes out is as simple as:

```bash
git remote set-url origin REPO-URL
```

GitHub is, of course, an incredible resource but, for my purposes, the switch made too much sense not to carry out.
