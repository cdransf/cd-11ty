---
title: 'Migrating to Fastmail'
date: '2022-04-13'
draft: false
tags: ['email', 'fastmail', 'gmail']
---

So you want to migrate over to Fastmail for your email — here's how you can go about doing so as seamlessly as possible.<!-- excerpt -->

I've used (and/or tried) nearly every email service I've heard of and have stuck with Fastmail the longest[^1]. They make onboarding and migrating easy, offer a fast and robust web application, support modern standards and nicely integrate contacts and calendar applications that also support [CardDav](https://en.wikipedia.org/wiki/CardDAV) and [CalDav](https://en.wikipedia.org/wiki/CalDAV) access[^2].

### Kicking things off

Register for an account at [fastmail.com](https://ref.fm/u28939392)[^3] — you'll be run through their lightweight onboarding process which allows you to select an address at a domain they own or use your own. If you use your own, they'll guide you through configuring the DNS records for it, often with registrar specific instructions.

They also offer [extensive documentation](https://www.fastmail.com/help/domain_management_custom_dns.html) on this process and offer a UI that validates that the records you have set are correct. For example, your finalized records would look like the following:

**MX:**

```text
example.com. IN MX 10 in1-smtp.messagingengine.com
example.com. IN MX 10 in1-smtp.messagingengine.com
```

**SPF:**

```text
@ TXT "v=spf1 include:spf.messagingengine.com -all"
```

**DKIM:**

These will be specific to your domain and can be found and set as follows:

1. Login to your FastMail account and go to Options –> Virtual Domains (or Manage –> Domains for a family/business account).
2. Scroll to the bottom, and you’ll see a new "DKIM signing keys" section. For each domain you have, you’ll see a DKIM public key.
3. Login to your DNS provider, and create a new TXT record for each domain listed and use the value in the "Public Key" column as the TXT record data to publish.

**Bonus points**

- Configure DMARC — Simon Andrews has [an excellent writeup](https://simonandrews.ca/articles/how-to-set-up-spf-dkim-dmarc#dmarc)on how to do this.
- Configure MTA-STS — there's a writeup on that [over at dmarcian](https://dmarcian.com/mta-sts/). It'll entail configuring an additional 3 DNS records and exposing an MTA-STS policy file[^6].

### Importing your email

Fastmail makes importing your email from your current provider painless via their [import tool](https://www.fastmail.com/go/settings/setup). With [detailed documentation](https://www.fastmail.help/hc/en-us/articles/360058753594-Import-your-mail) available in their [help center](https://www.fastmail.help/hc). If you're coming from Gmail or Google Workspace[^4] Fastmail will authenticate via OAuth (with the caveat that you'll need [IMAP enabled](https://support.google.com/mail/answer/7126229?hl=en)) and quickly pull over your email, contacts and calendars. Once the import is done, you can also use the [purge folders tool](http://fastmail.com/go/cleanfolders) to tidy up duplicate messages.

If you still need access to calendars from your own provider, Fastmail can [sync them and manage them](https://www.fastmail.help/hc/en-us/articles/360058752754-How-to-synchronize-a-calendar) from their web interface and then pass them down to your device alongside your dedicated Fastmail calendars.

### Syncing with your devices

First, set up [two-step verification](https://www.fastmail.help/hc/en-us/articles/360058752374-Using-two-step-verification-2FA-) — this should be done with a an authenticator app[^5]. Next, [create a password](https://www.fastmail.help/hc/en-us/articles/360058752854-App-passwords) for each app you'll access the service with — you can provision the permissions for the password to be fairly broad but, in the interest of security, I'd suggest scoping them to each app and the service they need to access (e.g. IMAP/SMTP for your Mail app on each device, CalDAV only for your calendar app on each device etc.). Fastmail has server names and ports required to access each service [outlined here](https://www.fastmail.help/hc/en-us/articles/1500000278342-Server-names-and-ports).

### Next steps

At this point you should have your data migrated, your domain configured and be able to access your account from all of your different apps and devices.

**Spam training**

Hop on over to Fastmail's [folder documentation](https://www.fastmail.help/hc/en-us/articles/1500000280301-Setting-up-and-using-folders) and scroll down to Advanced Options — I've configured custom folders I filter mail I _do_ want to receive into as well as the Archive and Sent system folders to learn messages as **not spam**. You can also flag inbound spam messages that slip through to help train the spam filter applied to your account.

**Filtering**

I would highly recommend creating rulesets to help filter messages that aren't critical out of your inbox. Fastmail's documentation on their mail rules and filters [can be found here](https://www.fastmail.help/hc/en-us/articles/1500000278122-Organizing-your-inbox#rules). I filter messages out of my inbox based on a few broad categories, namely:

- **Updates:** anything sent programmatically and pertinent but not critical (e.g. service or utility notifications and so forth).
- **Financial:** anything from financial institutions. I do this based on the TLD, e.g. `examplebank.com`.
- **Social:** anything from social networks or services. I do this based on the TLD, e.g. `linkedin.com`.
- **Promotions:** anything from a merchant or similar mailing list. I subscribe to a handful but don't want them in my inbox. I use [Fastmail's advanced folder options](https://www.fastmail.help/hc/en-us/articles/1500000280301-Setting-up-and-using-folders) to auto-purge this folder every 60 days.

I also use a few aliases to route mail elsewhere:

- **Deliveries:** anything referencing tracking numbers or shipment status get sent off to [Parcel](https://parcelapp.net).
- **Alerts:** uptime alerts and a few other notifications get sent off to [Things](https://culturedcode.com/things/) to be slotted as actionable tasks to be addressed.
- **Newsletters:** mailing lists get routed off to [Feedbin](https://feedbin.com) to be read (or not).
- **Reports:** I route DMARC/email reports to this folder in the event I need to review them (which is rarely if ever).

All of these particular folders live as children of my Archive folder and are auto-purged at different intervals. They're messages that are useful in the near term but whose utility falls off pretty quickly over time.

**Masked email**

If you're a [1Password](https://1password.com) user you can link your accounts and generate per-service, [masked emails for improved security](https://www.fastmail.help/hc/en-us/articles/4406536368911-Masked-Email). The idea here being that if your primary email is known, it can be used to trigger password resets at different services or leveraged in brute-force attacks, but this is mitigated by using a masked/pseudo-random address for each service.

Did I miss anything? [Email me](mailto:hi@coryd.dev)[^7].

[^1]: As an aside, [mailbox.org](https://mailbox.org) is also quite nice and offers some nice privacy features but isn't _quite_ as polished as Fastmail.
[^2]: Which amounts to seamless syncing with iOS at the system level or via an app like [DAVx](https://play.google.com/store/apps/details?id=at.bitfire.davdroid&hl=en) on Android.
[^3]: This is my referral link – you can skip that and go straight to [fastmail.com](https://fastmail.com).
[^4]: This one's aimed at you, free Google Workspace [forced migration](https://www.theverge.com/2022/1/19/22891509/g-suite-legacy-free-google-apps-workspace-upgrade).
[^5]: Think [1Password](https://1password.com) or [Authy](https://authy.com)
[^6]: This site is hosted at Vercel, but I have that policy file in a [categorically uninteresting GitHub repository](https://github.com/cdransf/mta-sts) configured using GitHub pages.
[^7]: At Fastmail, naturally.
