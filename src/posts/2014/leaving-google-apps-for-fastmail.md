---
title: Leaving Google Apps for Fastmail
date: '2014-01-18'
draft: false
tags: ['email', 'Fastmail', 'Google']
---

I recently began a process of re-evaluating the web services I use, the companies that provide them and an evaluation of where I store important data. I had used Google services extensively with Gmail handling my email, my contacts synced through Google contacts, calendars in Google calendar and documents in a Google Drive (I had used Google Reader extensively but switched to a [Fever](http://feedafever.com/ 'Fever Red hot. Well read.') installation following Reader's demise).<!-- excerpt --> While Google's services are world class, it became increasingly clear to me that if was not in my interest to store significant amounts of personal data with a company that has a financial interest in profiting from that information.

I wanted to replace the free services I was using with comparable services from companies whose interests we're aligned with their users (whose users were their customers -- not advertisers) and who had a clear business model (they provide a service their users pay for).[^1]

**Enter Fastmail**

I explored several options for email hosting, with [Rackspace Email](http://www.rackspace.com/email-hosting/webmail/ 'Rackspace Email - Affordable Hosted Email Solution for Small Business'), [Hushmail](https://www.hushmail.com/ 'Hushmail - Free Email with Privacy') and [Hover - email](https://www.hover.com/email 'Hover - domain name and email management made simple') among the services that caught my attention. Ultimately, I landed on [FastMail](https://www.fastmail.com/?STKI=11917049 'FastMail: Fast, reliable email'). Fastmail is a reliable, IMAP email provider with extensive support for custom domains. Fastmail also has strong spam prevention and [flexible server side filtering](https://www.fastmail.com/help/managing_email_advanced_rules.html 'Email Filter Rules - Advanced Rules - Help with sieve').

I began the transition to Fastmail by using [IMAP migration tool](https://www.fastmail.com/help/business_migrate.html 'Migrate existing accounts - Migrate existing accounts'). The migration process itself was relatively quick too (given the volume of email in my account)[^2].

While your email is being migrated you should take the time to [set up the aliases associated with your Fastmail account](https://www.fastmail.com/help/quick_tours_setting_up_domain.html 'Quick Tours - How to Use Your Own Domain'). Rather than being tied to a single email address like Google Apps, Fastmail allows you to use virtual aliases that allow you to use multiple email addresses (and even multiple domains) with the same Fastmail account.

During my switch to Fastmail I also took the time to flatten my email folder structure and associated server-side rules. I used to use umbrella folders/labels with individual subfolders/labels for senders within each category. While migrating to Fastmail I elected to keep only the umbrella categories which has allowed me to filter through broadly related emails that have been grouped together rather than tabbing through endless folders. This means I have less fine-grained control over where individual emails go but the time saved in not having to sort through endless subfolders and associated rules has been worth it.

My next step was updating my DNS records at my domain's registrar and waiting for propagation. Fastmail has [extensive documentation](https://www.fastmail.com/help/domain_management_custom_dns.html 'Own Domains - Custom DNS') on its required settings for custom DNS but, in most cases, you can simply set your MX records to point to Fastmail's servers:

```dns-zone
example.com. IN MX 10 in1-smtp.messagingengine.com
example.com. IN MX 10 in1-smtp.messagingengine.com
```

You can also point your namer servers to Fastmail as follows:

```dns-zone
example.com. NS ns1.messagingengine.com
example.com. NS ns2.messagingengine.com
```

Additionally, you will need to add an SPF record to your domain's DNS records as follows:

```dns-zone
@ TXT "v=spf1 include:spf.messagingengine.com -all"
```

Finally, you will also need to set up DKIM signing for your outgoing email. Fastmail has instructions on the DKIM setup process [on their site](http://blog.fastmail.com/2011/10/12/dkim-signing-outgoing-email-with-from-address-domain/). The general steps they provide are as follows:

1. Login to your FastMail account and go to Options –> Virtual Domains (or Manage –> Domains for a family/business account).
2. Scroll to the bottom, and you’ll see a new "DKIM signing keys" section. For each domain you have, you’ll see a DKIM public key.
3. Login to your DNS provider, and create a new TXT record for each domain listed and use the value in the "Public Key" column as the TXT record data to publish.

**Contacts and calendars**

While Fastmail provides an outstanding email experience, they do not currently support CardDav syncing for contacts ([CalDav support is currently in beta](https://www.fastmail.com/help/quick_tours_setting_up_domain.html 'Quick Tours - How to Use Your Own Domain') ). It is worth noting that Fastmail has an [LDAP](https://www.fastmail.com/help/address_book_ldap_access.html 'Address Book - LDAP Access') server that allows you to store contacts associated with your mail account (with an option to add people you correspond with automatically), but the server is read-only.

For now I'm using iCloud to sync my calendars and contacts and will weigh Fastmail's options for each when full support arrives. I'm currently leaning towards sticking with iCloud rather than adopting Fastmail's solutions.[^3] I didn't, admittedly, explore a host of options for calendar and contact syncing outside of iCloud. I use iCloud for a handful of other things and adopting sync services from yet another party seemed clunky.

**Chat**

Leaving Google Apps also meant leaving Google Hangouts (which I used semi-regularly to communicate with friends and family). Fastmail does offer [XMPP support](https://www.fastmail.com/help/features_chat.html 'Features - Chat Service') for certain accounts which I have used in place of Google Hangouts. How long Google continues to support XMPP and interoperability with Google Hangouts [remains to be seen](http://www.zdnet.com/google-moves-away-from-the-xmpp-open-messaging-standard-7000015918/ 'Google moves away from the XMPP open-messaging standard').

**Fastmail so far**

I've been using Fastmail since the end of November and couldn't be happier with it. The service has been extremely reliable (I haven't noticed a single instance of downtime). It's also been nice to use a traditional IMAP implementation after having used Google's quirky implementation for so long. Fastmail doesn't have the host of services Google provides, but it is a bullet proof email provider that I feel I can trust with my data which was exactly what I was looking to in switching[^4]

**Notes**

I did quite a bit of research before switching to Fastmail and the following posts helped push me to make the move:

- [Switching from Gmail to FastMail / Max Masnick](http://www.maxmasnick.com/2013/07/19/fastmail/ 'Switching from Gmail to FastMail / Max Masnick')
- [From Gmail to FastMail: Moving Away from Google – ReadWrite](http://readwrite.com/2012/03/19/from-gmail-to-fastmail-moving#awesm=~othfJ88hm9Tp8X 'From Gmail to FastMail: Moving Away from Google – ReadWrite')
- [FastMail is My Favourite Email Provider](http://web.appstorm.net/reviews/email-apps/fastmail-is-my-favourite-email-provider/ 'FastMail is My Favourite Email Provider')

Have you moved to Fastmail? Are you thinking of doing so? [Let me know your thoughts](mailto:coryd@hey.com) on it or the move to it. You can sign up for Fastmail [here](https://www.fastmail.com).

[^1]: My interest in this idea, specifically was sparked by this blog post by Marco Arment: [Let us pay for this service so it won’t go down](http://www.marco.org/2011/04/05/let-us-pay-for-this-service-so-it-wont-go-down 'Let us pay for this service so it won’t go down – Marco.org')
[^2]: I had previously consolidated all of my old email accounts in to my Google Apps account via forwarding and by checking them via IMAP through Gmail.
[^3]: I currently use the first-party mail clients on both iOS and OSX so not having contacts and calendars synced with Fastmail is really only an issue when I the Fastmail web interface (which isn't all that frequently). For now I've been manually uploading vCard files to Fastmail which is clunky, but not all that annoying. I _do_ miss being able to create events by clicking on parsed text (which Google Apps supported), but not all that much.
[^4]: If you do get tripped up switching from another provider, Fastmail does have extensive documentation. [You can also feel free to get in touch](mailto:hi@coryd.dev).
