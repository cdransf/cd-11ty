---
date: '2024-03-02'
title: 'Go ahead and block AI web crawlers'
description: 'AI companies are crawling the open web to, ostensibly, improve the quality of their models and products. This process is extractive and accrues the benefit to said companies, not the owners of sites both small and large.'
tags: ['AI', 'tech', 'development']
---
AI companies are crawling the open web to, ostensibly, improve the quality of their models and products. This process is extractive and accrues the benefit to said companies, not the owners of sites both small and large.<!-- excerpt -->

**[Per The Verge and OpenAI](https://www.theverge.com/2023/8/7/23823046/openai-data-scrape-block-ai)**
> "Web pages crawled with the GPTBot user agent may potentially be used to improve future models …"
>
> "…allowing GPTBot to access your site can help AI models become more accurate and improve their general capabilities and safety."

All of which assumes that you see some broader benefit to letting a private institution improve their product with negligible benefit to you.

**[Again, via The Verge](https://www.theverge.com/2023/8/21/23840705/new-york-times-openai-web-crawler-ai-gpt)**
> *The New York Times* has blocked OpenAI's web crawler, meaning that OpenAI can't use content from the publication to train its AI models. If you check [the NYT's robots.txt page](https://www.nytimes.com/robots.txt), you can see that the *NYT* disallows GPTBot, the crawler that OpenAI introduced [earlier this month](https://www.theverge.com/2023/8/7/23823046/openai-data-scrape-block-ai).

The publication has gone on to block additional crawlers and you can see the full list by [accessing their robots.txt file](https://www.nytimes.com/robots.txt). There are open resources like [Dark Visitors](https://darkvisitors.com/) cropping up to maintain and provide lists of extractive AI crawlers.

All of this marks a clear and fundamental distinction between search crawlers and AI crawlers. The former extracts value from open content, the latter indexes and directs users *to* content, enhancing discoverability and aggregating data.

It is not incumbent upon news publications, blogs, social media sites or any other platform to cede this data to AI companies for free, nor should they. But, as search giants (and startups — looking at you Browser Company[^1]) lean (questionably) into surfacing  extractive summaries rather than directing users to original, independent results, it makes more and more sense to block the agents they're using to crawl and surface those answers.

Licensing deals to offer content up to AI companies or existing tech giants are similarly attractive and again, [only of benefit to the company yielding access to data they control but didn't create](https://www.reuters.com/technology/reddit-ai-content-licensing-deal-with-google-sources-say-2024-02-22/).

That there's some sort of broad societal benefit to all of this is, at this point, mere speculation. What this does accomplish though is allow companies to continue to champion chat bots and image generators that remain rife with issues while chasing ever increasing valuations.

I'm not excited when a product I use integrates AI, I'm weary and wary of it. What does it do to make the experience better? I'd love to know. Copilot is a mild improvement over traditional autocomplete. Advice on a subject is best provided by someone that has experience on what they're advising you on rather than a bucket of bits that will spit out believable-sounding text output.

The companies building these tools will argue that more data will improve accuracy and improve the tools overall, but you have no responsibility to concede that point. Blocking these crawlers also assumes that you trust these companies to obey a long-lived, standard tool like `robots.txt` and given their argument that everything they can access is fair game for ingestion, it's fair to question whether they'll have the basic decency to do so.

My `robots.txt` looks like this — if I'm missing anything, [I'd love to know](https://coryd.dev/contact).

```text
Sitemap: https://coryd.dev/sitemap.xml

User-agent: *
Disallow:

User-agent: AdsBot-Google
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: AwarioRssBot
Disallow: /

User-agent: AwarioSmartBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: magpie-crawler
Disallow: /

User-agent: omgili
Disallow: /

User-agent: omgilibot
Disallow: /

User-agent: peer39_crawler
Disallow: /

User-agent: peer39_crawler/1.0
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: YouBot
Disallow: /
```

[^1]: I've yet to definitively identify Arc Search's user agent but I'd like to, so I can block it and share it — but that assumes they respect `robots.txt` declarations.