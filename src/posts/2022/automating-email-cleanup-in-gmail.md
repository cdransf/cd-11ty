---
title: 'Automating email cleanup in Gmail'
date: '2022-03-28'
draft: false
tags: ['gmail', 'automation']
---

Lately I've been leaning into automating the cleanup of email I receive in Gmail using a combination of Inbox-era categories that the application still exposes via search and [Google Apps Script](https://www.google.com/script/start/).<!-- excerpt -->

I wasn't using Gmail when Inbox was available (I'm sure I missed out) and know not all of the most beloved features have been migrated over to Gmail proper. That said, there _are_ some handy filters that didn't ascend to Gmail's tabbed inbox interface but are still available to create rules against[^1].

I've created filter rules leveraging all of these legacy filters to automatically categorize messages the same way the current tabs do. These rules look like the following:

```
# emails gmail categorizes as travel related
Matches: category:travel
Do this: Apply label "Traveling"

# emails gmail categorizes as receipts
Matches: category:purchases
Do this: Apply label "Receipts

# emails gmail categorizes as finance related
Matches: category:finance
Do this: Apply label "Financial"

# emails gmail categorizes as reservations
Matches: category:reservations
Do this: Apply label "Reservations"
```

Expanding on this, I also have a few forwarding addresses in place to conditionally handle other types of messages. First up, I use some compiled search terms to redirect emails indicating something I've ordered has shipped off to [Deliveries.app](https://junecloud.com). That rule looks like this:

```
Matches: subject:({"has shipped" "was shipped" "on its way" "tracking number" "shipment from order" "order shipped confirmation" "Shipped:"})
Do this: Skip Inbox, Mark as read, Apply label "Deliveries", Forward to <UNIQUE-ID>@junecloud.com
```

For newsletters, I sign up using Gmail's plus addressing scheme to automatically label them as `newsletters`[^2]:

```
Matches: to:(cory.dransfeldt+newsletters@gmail.com)
Do this: Skip Inbox, Mark as read, Apply label "Newsletters", Forward to <UNIQUE-ID>@newsletters.feedbin.com
```

For both newsletters and deliveries this leaves me with a fair amount of archived mail that arguably decreases in or loses all value over time[^3].

I take a similar approach to actionable/alert-style messages:

```
Matches: <SUPER IMPORTANT CONDITION HERE>
Do this: Apply label "Alerts", Forward to <UNIQUE-ID>@todoist.net, Mark it as important, Categorize as Primary
```

This rule leaves alerts prominently in my inbox and as an actionable task in [Todoist](https://todost.com). Keeping the email in focus and in my Todoist inbox is, arguably, redundant but helps keep the issue front and center until it's resolved.

### On to Google Apps script

To clean up these various transactional messages I use several different Google Apps Script scripts. Each runs twice a month on the 1st and 15th and is targeted at cleaning up a category of messages. These runs are scheduled using the `Time-driven` event source and the `Month timer` time based trigger.

For example, to clear old newsletters, I use the following:

```javascript
function batchDeleteEmail() {
  var SEARCH_QUERY = 'label:newsletters -label:inbox'
  var batchSize = 100
  var searchSize = 400
  var threads = GmailApp.search(SEARCH_QUERY, 0, searchSize)
  for (j = 0; j < threads.length; j += batchSize) {
    GmailApp.moveThreadsToTrash(threads.slice(j, j + batchSize))
  }
}
```

This rule iteratively deletes all messages with the label `newsletters`, omitting messages that, for whatever reason, might have landed in my inbox.

The rules for deliveries and alerts operate in very much the same way, but with a different query for each:

**Deliveries (omitting Gmail-identified receipts and the inbox)**

```
'label:deliveries -label:inbox -label:receipts'
```

**Alerts (omitting the inbox)**

```
'label:alerts -label:inbox'
```

Unrelated to cleanup, I also mark any unread emails in my archive as read, with this script running every minute using the `Time-driven` event source, `Minute timer` and is executed every minute (heavy-handed perhaps, but the error-rate for this has only been 0.02%):

```javascript
function markArchivedAsRead() {
  var SEARCH_QUERY = 'label:unread -label:inbox'
  var batchSize = 100
  var searchSize = 400
  var threads = GmailApp.search(SEARCH_QUERY, 0, searchSize)
  for (j = 0; j < threads.length; j += batchSize) {
    GmailApp.markThreadsRead(threads.slice(j, j + batchSize))
  }
}
```

I have given some thought to refactoring my cleanup scripts such that the batch delete consumes an array of the individual search queries, iterating over them much like it does the threads it's operating on but, at that point, I'd be looking at a loop over the argument and then over the threads in a child loop when separate script functions can run without that being a concern.

[^1]: I am puzzled that Forums made the cut as a featured option.
[^2]: Don't email me via Feedbin. I'll miss it or it'll just be annoying.
[^3]: I care when something ships, I don't care to reference the tracking info months later.
