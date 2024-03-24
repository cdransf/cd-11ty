---
date: '2022-05-31'
title: 'Apple-centric digital privacy tools'
description: "A rundown of privacy tools that work well with Apple's technology ecosystem."
tags: ['Apple', 'privacy', 'iOS', 'macOS', 'tech']
---

A rundown of privacy tools that work well with Apple's technology ecosystem.<!-- excerpt -->[^1]

## Email providers

Ubiquitous free email providers profit by mining user data (whether humans are involved or not). Your inbox acts as a key to your digital life, and you should avoid using any provider that monetizes its contents.

- <a onclick="fathom?.trackEvent('Fastmail referral') href="https://ref.fm/u30190984">Fastmail</a>[^2]: based in Melbourne, Australia Fastmail offers a range of affordably priced plans with a focus on support for open standards (including active development support for [JMAP](https://jmap.io) and the [Cyrus IMAP email server](https://fastmail.blog/open-technologies/why-we-contribute/)). They also [articulate a clear commitment to protecting and respecting your privacy](https://www.fastmail.com/values/) and offer an extensive [rundown of the privacy and security measures they employ on their site](https://www.fastmail.com/privacy-and-security/).
  - I would also recommend exploring their [masked email implementation](https://www.fastmail.help/hc/en-us/articles/4406536368911-Masked-Email), which integrates seamlessly with [1Password](https://1password.com) (though using 1Password isn't required).
- [mailbox.org](https://mailbox.org): based in Germany, [mailbox.org](http://mailbox.org) also has [a long history](https://mailbox.org/en/company#our-history) and [commitment to privacy](https://mailbox.org/en/company#our-mission). Their service is reliable, straightforward and fully featured (it's based off of a customized implementation [Open-Xchange](https://www.open-xchange.com)) and supports features like incoming address blocking, PGP support and so forth.
- [Proton Mail](http://protonmail.com): Proton offers a host of encrypted tools, ranging from mail to drive, calendaring and VPN services. They're also the only option in this list that includes end-to-end encryption. The service is extremely polished and reliable but, it's worth noting, doesn't support access to your email via open standards like IMAP/SMTP without the use of a cumbersome, desktop-only, bridge application.
- [iCloud+](https://support.apple.com/guide/icloud/icloud-overview-mmfc854d9604/icloud): if you're paying for an Apple iCloud subscription you'll get access to the option to add a custom email domain to your account to use with Apple's iCloud Mail service. This is private inasmuch as the data isn't mined for monetization against personalized ads, but is also bare-bones in terms of functionality. It supports IMAP and push notifications on Apple's devices but features like rules, aliases and so forth are extremely limited compared to the previously mentioned providers. This is better than most free providers, but hardly the best option.
  - iCloud+ _does_ also offer a [Hide My Email](https://support.apple.com/guide/icloud/what-you-can-do-with-icloud-and-hide-my-email-mme38e1602db/1.0/icloud/1.0) feature to conceal your true email address, much like Fastmail.

## Email apps

- [Apple Mail](https://support.apple.com/mail): Apple's Mail app is simple but also fully featured and reliable to the point of being a bit boring. It also has enhanced privacy features as of iOS 15 and macOS 12 in the form of [Mail Privacy Protection](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c7/ios).
- [Canary Mail](https://canarymail.io/): a third-party email with a reasonable price tag and a heavy focus on privacy and security, Canary offers a number of enhancements like read receipts, templates, snoozing, PGP support and calendar/contact integration. The design hews tightly to iOS and macOS platform norms but, naturally, is not quite as tightly integrated as Apple's first-party mail app.
- [Mailmate](https://freron.com/): a long-running, highly configurable mail app with a strict focus on IMAP support, Mailmate is an excellent option on macOS and also offers strong support for authoring messages in markdown.

## Safari extensions

- [1Blocker](https://1blocker.com): a highly configurable ad and tracker blocker. Independently maintained and actively developed it also offers a device-level firewall to block trackers embedded in other apps on your device.
- [Super Agent](https://www.super-agent.com): this extension simplifies the process of dealing with the modern web's post-GDPR flood of cookie consent banners by storing your preferences and uniformly applying them to sites that you visit. This allows you to avoid the banners altogether while limiting what's allowed to something as restrictive as, say, functional cookies only.
- [Hush](https://oblador.github.io/hush/): another option to deal with cookie banners by simply blocking the banners outright.

## DNS providers

- [nextDNS](https://nextdns.io/?from=m56mt3z6): I use nextDNS on my home network for basic security and have a more restrictive configuration that heavily filters ads at the DNS level on specific devices. This allows me to block ads, trackers and other annoyances at the DNS level, which covers anything embedded in apps or other services running on my device.
- [Cloudflare 1.1.1.1](https://www.cloudflare.com/learning/dns/what-is-1.1.1.1): Cloudflare's 1.1.1.1 service doesn't offer the same features as nextDNS, but is still preferable to Google's offering or your ISP's default.
- [iCloud Private Relay](https://support.apple.com/en-us/HT212614): Another iCloud+ offering, iCloud Private Relay offers _some_ protection by relaying your traffic in Safari (and Safari only) through a pair of relays to obfuscate your actual IP address and location.

## Password managers

- [1Password:](https://1password.com): I've used 1Password for over 11 years and have yet to have any significant issues with the service. It integrates smoothly with Fastmail to generate masked email addresses, has added support for storing and generating ssh keys and application secrets, supports vault and password sharing and works across platforms. Highly recommended.[^3]
- [Bitwarden](https://bitwarden.com): I haven't made use of Bitwarden, but have heard plenty of positive feedback over the years.

## VPN providers

- [IVPN](https://www.ivpn.net/): my current choice for a VPN provider, it's apps are modern, reliable and offer support for per network default behavior, wireguard, multihop connections and numerous endpoints around the globe.
- [Mullvad](https://mullvad.net/en/): an open source, commercial VPN based in Sweden, Mullvad offers both WireGuard and OpenVPN support.
- [Mozilla](https://www.mozilla.org/en-US/products/vpn/): offered by the non-profit Mozilla Foundation, this is another compelling offering from an organization with a track record of fighting for the open web and preserving user privacy.

For now, I've scoped this post to platforms and tools that are central to maintaining your online privacy. But, with that said, each app you use should be examined to determine if and how it fits with your approach towards privacy.

Everything you use is going to glean data from your interactions with it, and it's worth considering that tool's stance on privacy, tracking and monetization before investing your time and data into using it.

**Other resources**

My friend Nathaniel Daught has an excellent post with similar resources on his blog [that you should take a look at as well](https://daught.me/blog/privacy-security-tools-2022).

[^1]: This post expands on a [previous post](https://coryd.dev/blog/digital-privacy-tools) with a quick rundown preceded by a link to the New York Times on the same subject.
[^2]: This is my referral link – you can skip that and go straight to [fastmail.com](https://fastmail.com).
[^3]: I also generate and store answers to security questions here, rather than providing answers that may be publicly known or derived.
