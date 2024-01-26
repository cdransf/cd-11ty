---
date: '2024-01-26'
title: 'Mobile web development with Codespaces'
description: 'Wherein the author describes making code changes on a mobile device (iOS) and pushing them live.'
tags: ['development', 'iOS']
---

I was on vacation recently and, because I'm exactly that nerd, I ended up wanting to add an `npm` package and `postbuild` step to this site.<!-- excerpt -->[^1]

To do this, what I did was:

1. Spin up a [GitHub Codespace](https://github.com/features/codespaces) for this project.
2. Add the Codespace to [Secure Shellfish](https://secureshellfish.app/)[^2]
3. Access the Codespace in Secure Shellfish and run the appropriate `npm install` command.
4. Add [the secrets my site requires to run](https://github.com/cdransf/coryd.dev/blob/main/.env) per [GitHub's instructions](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-your-account-specific-secrets-for-github-codespaces#adding-a-secret).
5. Run `npm start` and verify the build in the Codespace URL produced for the application running on `localhost:<PORT NUMBER>`[^3]
6. Push up the changes from the Codespace.

An alternative approach would be to make edits to the code locally on iOS using Secure Shellfish's `Files.app` integration — this would expose the application files as a folder inside of the Secure Shellfish provider in `Files.app`. You could make the edits using [Runestone](https://runestone.app/) which also integrates nicely with `Files.app`.

This isn't approach I'd use for long, focused dev sessions (or critical applications/changes) but it'll do for quick, low-stakes changes on mobile.

[^1]: To send outbound webmentions. [See Remy's docs.](https://webmention.app/docs#using-the-command-line)
[^2]: Which is an *awesome* ssh client — and a terminal on macOS (I only use it on iOS though).
[^3]: [Eleventy](https://www.11ty.dev/), naturally.