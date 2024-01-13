---
date: '2023-03-19'
title: 'Scheduled Eleventy builds on Vercel with cron-triggered GitHub actions'
description: "In an effort to get away from client-side Javascript and embrace Eleventy for what it is (a static site generator), I've dropped my social-utils instance offline and my now-playing track display on my home page that still relied on it."
tags: ['Eleventy', 'JavaScript', 'automation', 'GitHub', 'GitHub actions', 'cron', 'YAML', 'API']
---

In an effort to get away from client-side Javascript and embrace Eleventy for what it is (a static site generator), I've dropped my [social-utils](https://github.com/cdransf/social-utils) instance offline and my now-playing track display on my home page that still relied on it.<!-- excerpt -->

To update my feeds ([feed.xml](https://coryd.dev/feed.xml) and [follow.xml](https://coryd.dev/follow.xml)) and [now page](/now) I've adopted [@11ty/eleventy-fetch](https://www.npmjs.com/package/@11ty/eleventy-fetch) and regular builds at [Vercel](https://vercel.com/) that are triggered by [GitHub Actions](https://docs.github.com/en/actions) that leverage cron for scheduling. [The workflow file](https://github.com/cdransf/coryd.dev/blob/e886857387661ceeba4f2b368989ec32f0c3f121/.github/workflows/scheduled-build.yaml) looks like this:

{% raw %}

```yaml
name: Scheduled Vercel build
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
  schedule:
    - cron: '0 * * * *'
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

{% endraw %}

This leverages three different Vercel secrets specific to your account that must be added to the [GitHub Actions Secrets](https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28) for your project (`Project repo -> Settings -> Secruity section -> Secrets and variables -> Actions`).

Your Vercel org ID and project ID will be at the bottom of your organization/personal account's settings (in the General section), with your project ID located in the same section of your project settings.

If you need to manually trigger a build, you can do so using a workflow with a {% raw %}`[workflow_dispatch]`{% endraw %} trigger like this:

{% raw %}

```yaml
name: Manual Vercel build
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on: [workflow_dispatch]
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

{% endraw %}

Once you have the appropriate secrets and workflow file in place, you can let GitHub take care of regularly rebuilding and refreshing your site.
