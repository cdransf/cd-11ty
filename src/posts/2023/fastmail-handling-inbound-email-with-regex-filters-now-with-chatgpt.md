---
date: '2023-02-17'
title: 'Workflows: handling inbound email on Fastmail with regular expressions (now featuring ChatGPT)'
description: "I've been using Fastmail for years now and have explored a number of different approaches to handling mail. I've approached it by creating rules targeting lists of top level domains, I've gone with no rules at all and a heavy-handed approach to unsubscribing from messages (operating under the idea that _everything_ warrants being seen and triaged)."
draft: false
tags: ['Email', 'Fastmail', 'regular expressions', 'workflows', 'ChatGPT']
image: https://cdn.coryd.dev/blog/fastmail-workflow.jpg
---

I've been using Fastmail for years now and have explored a number of different approaches to handling mail. I've approached it by creating rules targeting lists of top level domains, I've gone with no rules at all and a heavy-handed approach to unsubscribing from messages (operating under the idea that _everything_ warrants being seen and triaged) and I've even used HEY.<!-- excerpt -->[^1]

For now, I've approached filtering my mail by applying regular expressions to reasonably broad categories of incoming mail[^2]. My thinking with this approach is that will scale better over the long term by applying heuristics to common phrases and patterns in incoming mail without the need to apply rules to senders on a per address or domain basis.

{% image 'https://cdn.coryd.dev/blog/fastmail-workflow.jpg', 'A diagram of my Fastmail workflow', 'image__banner' %}

## Alias-specific rules

I have four aliases that I regularly provide to different services. One is for newsletters and routes them to [Matter's app](https://getmatter.com), another routes directly to my saved articles in the same app, another routes different messages to my [Todoist](https://todoist) inbox and a final one serves as the recovery email on my grandfather's accounts (in the event anything goes awry).

These work by checking that the `To/CC/BCC` matches the appropriate alias before filing them off to `Archive/Newsletters`, `Archive/Saves` or `Notifications`, respectively. These folders are configured to auto-purge their contents at regular intervals as they are typically consumed in the context of the application that they're forwarded to (and are only filed into folders for reference in the event something goes wrong in said applications).

## A quick failsafe

In the event I've failed to tune a regular expression properly or an actual person triggers a match I have a rule that is executed after the aforementioned alias-specific rules that stops all rule evaluations for _any_ address in my contacts.

**Update:** I've run every regular expression and glob pattern I apply to my messages through ChatGPT to see if it could simplify, combine and otherwise improve them (namely reducing false positives). This has worked quite well (outside the time required to coax ChatGPT to the best possible answer). Further, my deliveries rule that forwards to Parcel now also requires both a subject and body match before forwarding.

[I also have a rule containing regular expressions that also skips evaluations for login pin codes, meeting/appointment reminders and common security notices](https://pastes.coryd.dev/mail-regexes-alerts/markup).

```json
{
    "conditions": [
      {
        "lookHow": "regexp",
        "lookFor": "(?i)\\b(PIN|Verify|Verification|Confirm|One-Time|Single(-|\\s)Use)\\b.*?(passcode|number|code.*$)",
        "lookIn": "subject"
      },
      {
        "lookHow": "regexp",
        "lookFor": "(?i)^.*upcoming (appointment|visit).*",
        "lookIn": "subject"
      },
      {
        "lookFor": "(?i)^.*new.*(sign(in|-in|ed)|(log(in|-in|ged)))",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookFor": "(?i)^.*(meeting|visit|appointment|event).*\\b(reminder|notification)",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookFor": "(?i)^.*verify.*(device|email|phone)",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookHow": "regexp",
        "lookFor": "(?i)^.*Apple.*(ID was used to sign in)",
        "lookIn": "subject"
      },
      {
        "lookFor": "(?i)^.*(computer|phone|device).*(added)",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookHow": "regexp",
        "lookFor": "(?i)^2FA.*(turned on)",
        "lookIn": "subject"
      },
      {
        "lookIn": "subject",
        "lookFor": "(?i)^.*confirm.*(you)",
        "lookHow": "regexp"
      },
      {
        "lookFor": "(?i)^.*you.*((log|sign)\\s?-?\\s?in).*$",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookHow": "is",
        "lookFor": "notifications@savvycal.com",
        "lookIn": "fromEmail"
      },
      {
        "lookIn": "subject",
        "lookFor": "\\b(?:RSVP|invitation|event|attend)\\b",
        "lookHow": "regexp"
      }
```

## Mapping categories as folders

I've tailored these rules to align with folders on a per-topic basis. I have a broad `Financial` folder for things like receipts, bank statements and bills. That folder contains a few granular sub-folders like `Deliveries`, `Media`, `Medical`, `Promotions` and so forth. All multistep rules are set to filter messages when `any` of the tabled criteria matches.

The top level `Financial` rule [looks like this](https://pastes.coryd.dev/mail-regexes-financial/markup).

```json
"conditions": [
      {
        "lookFor": "([Ee]quifax.*$|[Ee]xperian.*$|[Tt]ransunion.*$|[Aa]mazon[Kk]ids.*$|[Vv]isa[Pp]repaid[Pp]rocessing.*$|americanexpress.*$|paddle.*$|instacart.*$|^.*discover.*$|^.*aaa.*$)",
        "lookIn": "fromEmail",
        "lookHow": "regexp"
      },
      {
        "lookFor": "([Gg]andi.*$|[Hh]over.*$|[Tt]ucows.*$|[Gg]o[Dd]addy.*$|[Nn]ame[Cc]heap.*$|[Vv]enmo.*$|[Pp]ay[Pp]al.*$|[Aa][Cc][Ii]payonline.*$|[Uu]se[Ff]athom.*$)",
        "lookIn": "fromEmail",
        "lookHow": "regexp"
      },
      {
        "lookHow": "regexp",
        "lookFor": "(?i)you(?:r)?[\\s-]*(?:pre[\\s-]?order|pre[\\s-]?order(?:ed))",
        "lookIn": "body"
      },
      {
        "lookIn": "toCcBccName",
        "lookFor": "*[Aa][Pp][Pp][Ll][Ee] [Cc][Aa][Rr][Dd]*[Ss][Uu][Pp][Pp][Oo][Rr][Tt]*",
        "lookHow": "glob"
      },
      {
        "lookHow": "regexp",
        "lookIn": "subject",
        "lookFor": "\\b(?i)(receipt|bill|invoice|transaction|statement|payment|order|subscription|authorized|booking|renew(al|ing)?|expir(e|ed|ing)?|deposit|withdrawl|purchased)\\b.*"
      },
      {
        "lookFor": "(?i)\\b(receipt|bill|invoice|transaction|statement|payment|order|subscription|authorized|booking|renew(al|ing)?|expir(e|ed|ing)?|deposit|withdrawl|purchased|(itunes|apple) store|credit (score|report)|manage (account|loan))\\b.*",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookHow": "regexp",
        "lookFor": "(?i)\\b(gift (card|certificate)|zelle|new plan|autopay|reward certificate)\\b.*",
        "lookIn": "subject"
      }
    ],
```

`Deliveries` follow a similar pattern with rule sets intended to capture messages with package tracking information or other details. I kickstarted this rule by, naturally, referencing [this answer from StackOverflow](https://stackoverflow.com/a/5024011).

All the regular expressions contained in this answer are matched against the `Body` of inbound messages before being forwarded to [Parcel Email](https://parcelapp.net/help/parcel-email.html)[^3]. These rules are supplemented by a few edge case rules targeted at the `Subject` field:

```json
"conditions": [
      {
        "lookHow": "regexp",
        "lookIn": "body",
        "lookFor": "\\b(?:1Z[\\dA-Z]{16}|[\\d]{20}|[\\d]{22}|[\\d]{26}|[\\d]{15}|E\\D{1}[\\d]{9}|[\\d]{9}[ ]?[\\d]{4})\\b"
      },
      {
        "lookIn": "subject",
        "lookHow": "regexp",
        "lookFor": "^.*[Aa] shipment (from|to).*([Ww]as|[Hh]as|is on the way).*?$"
      }
    ],
```

Finally, I have a rule intended to catch anything that falls through the cracks[^4]:

```json
"conditions": [
      {
        "lookFor": "usps|fedex|narvar|shipment-tracking|getconvey",
        "lookHow": "regexp",
        "lookIn": "fromEmail"
      },
      {
        "lookFor": "?(ed*x delivery manager|*ed*x.com|tracking*updates*)",
        "lookHow": "glob",
        "lookIn": "fromName"
      },
      {
        "lookFor": "(?i)^.*package (has been?|was) delivered.*$",
        "lookHow": "regexp",
        "lookIn": "subject"
      }
    ],
```

My `medical` and `media` rules follow a basic pattern that could be approximated using a per-line sender TLD match[^5]:

```json
"conditions": [
      {
        "lookFor": "^(?i:Disneyplus.*$|Netflix.*$|^.*hulu.*$|HBOmax.*$|MoviesAnywhere.*$|iTunes.*$|7digital.*$|Bandcamp.*$|Roku.*$|Plex.*$|Peacock.*$)",
        "lookHow": "regexp",
        "lookIn": "fromEmail"
      }
    ],
```

I'd recommend paring this down to match whichever `media` and `medical` providers email you.

This pattern of filtering and filing continues for several additional categories.

**Financial/Tickets**

```json
"conditions": [
      {
        "lookFor": "\\b(?i)(concert|event|show|performance|ticket|admission|venue|registration)\\b",
        "lookHow": "regexp",
        "lookIn": "subject"
      }
    ],
```

**Travel (non-forwarding)**

```json
"conditions": [
      {
        "lookHow": "regexp",
        "lookFor": "\\b(?i)(hotel|reservation|booking|dining|restaurant|travel)(s)?( |-)?(confirmation|reservations?|bookings?|details)\\b",
        "lookIn": "subject"
      },
      {
        "lookFor": "\\b(?i)(uber|lyft|rideshare)(s)?( |-)?(receipt|confirmation|ride summary|your ride with)\\b",
        "lookHow": "regexp",
        "lookIn": "subject"
      }
    ],
```

**Travel (forwarding)**
These are designed to capture confirmations sent by Southwest and are sent off to [Flighty](https://www.flightyapp.com) before being sorted.

```json
"conditions": [
      {
        "lookIn": "subject",
        "lookHow": "regexp",
        "lookFor": "\\b(?i)(flight|confirmation|you're going to).*\\b(reservation|on)\\b"
      }
    ],
```

**Annoying customer support follow-ups**

```json
"conditions": [
      {
        "lookHow": "glob",
        "lookFor": "*customer*?(are|uccess|upport)",
        "lookIn": "fromName"
      }
    ],
```

**[Promotional messages (that you haven't unsubscribed from)](https://pastes.coryd.dev/mail-regexes-promotions/markup)**

```json
"conditions": [
      {
        "lookHow": "regexp",
        "lookIn": "fromEmail",
        "lookFor": "(^.*store-news.*$|^.*axxess.*$)(\\b.*?|$)"
      },
      {
        "lookFor": "^(?=.*\\b(?i)(final offer|limited time|last chance|black friday|cyber monday|holiday|christmas|free shipping|send (gift|present))\\b).*\\b(?i)(discount|save|\\d+% off|free)\\b",
        "lookIn": "subject",
        "lookHow": "regexp"
      },
      {
        "lookIn": "body",
        "lookFor": "\\b\\d{1,2}(?:\\.\\d+)?% off\\b",
        "lookHow": "regexp"
      },
      {
        "lookIn": "subject",
        "lookFor": "\\b(?:new|updated|special|limited-time)\\s+(?:offers|deals|discounts|promotions|sales)\\b",
        "lookHow": "regexp"
      }
    ],
```

**Social networking messages**
These I've left as a simple list wherein `any` included top level domain is filed away as I don't belong to many social networks, and they change fairly infrequently.

**DMARC notifications (depending on how you have your policy record configured)**

```json
"conditions": [
      {
        "lookIn": "subject",
        "lookHow": "regexp",
        "lookFor": "((^.*dmarc.*$)(\\b.*?|$))"
      },
      {
        "lookIn": "fromEmail",
        "lookHow": "regexp",
        "lookFor": "((^.*dmarc.*$)(\\b.*?|$))"
      }
    ],
```

That covers _most_ of what I use to manage my mail (outside of anything particularly personal). I fully expect the regular expressions I'm using could stand to be refined and I plan on continuing to do just that. But, with that said, things have worked better than I expected so far and false positives/mis-categorizations have been infrequent.

If you have any questions or suggestions I'm all ears. Feel free to [email me](mailto:hi@coryd.dev) or ping me on [Mastodon](https://social.lol/@cory).

[^1]: Before, well, _all that_.
[^2]: Fastmail has some helpful tips on regular expression rules [here](https://www.fastmail.help/hc/en-us/articles/360060591193-Rules-using-regular-expressions)
[^3]: Fun fact, this is, apparently, no longer being actively developed — presumably because email, as we all know, is an absolute pleasure to parse and deal with.
[^4]: This rule doesn't forward over to Parcel as it typically captures secondary notices that either don't contain or duplicate the original tracking info.
[^5]: I know, I called this inefficient earlier.
