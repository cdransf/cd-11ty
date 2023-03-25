---
date: '2023-03-24'
title: '.env files in Eleventy'
draft: false
tags: ['.env', '11ty', 'eleventy']
---

**dotenv-flow:**

> **dotenv-flow** extends **dotenv** adding the ability to have multiple `.env*` files like `.env.development`, `.env.test` and `.env.production`, also allowing defined variables to be overwritten individually in the appropriate `.env*.local` file.

The Eleventy docs recommend the `dotenv` package for working with `.env` files[^1], but I've found `dotenv-flow` to be a bit more useful inasmuch as support for `.env*` file patterns make development more convenient.<!-- excerpt -->

[^1]: Which is awesome — it works perfectly.
