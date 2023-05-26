---
date: '2023-05-26'
title: 'Domain names as discoverable personal identifiers for the web'
draft: false
tags: ['tech', 'privacy']
---

What if — and hear me out here — instead of using email or a platform-owned account, we leveraged individual domain names as personal identifiers for the web?<!-- excerpt -->

Our current state of affairs is essentially this: if you want to use a service or establish a presence online you have to register to use that service. That service is typically a closed platform that verifies that you are who you are via your email address or by signing you in with an identity provider like Apple, Google, Facebook etc. You, however, don't own that email address (the fine folks operating your chosen mail service do) and you don't own that account — you're a guest on someone else's platform.

At each step you cede control of your identity online for the convenience afforded to you at each step. For this convenience each vendor involved grows their platform and is presented with opportunities to monetize your presence there. You have a presence online but you don't *really* own or control that presence online. You can build an audience or connections but you can't take them with you — it ends up being a trap. Awesome.

There's a compelling case here to, instead, upend this arrangement and start back at a domain name that each user owns and controls. If you own a domain name and want to establish an email address you can do so at any provider that supports using your own domain name. If that provider fails or does something else you dislike, you can walk away and take your domain name with you. You own the domain, you own the address, you can use different infrastructure. You can do the exact same thing with a web host and a personal website — spin up a new account, point your `A` record etc. and move on.

Now, we're seeing a backlash to platforms as they age and are mismanaged in an attempt to extract value from users, with their social graph held hostage.[^1] What we *do* have are specifications like [WebFinger](https://webfinger.net):

> For a person, the type of information that might be discoverable via WebFinger includes a personal profile address, identity service, telephone number, or preferred avatar. For other entities on the Internet, a WebFinger resource might return JRDs containing link relations that enable a client to discover, for example, that a printer can print in color on A4 paper, the physical location of a server, or other static information.

The opportunity here, to my mind, lies in making obtaining, maintaining and facilitating discovery of information for users online outside of platforms and, instead, tied to a domain name that is entirely controlled by a given user. That user could expose as much or as little information as they would like via specifications like WebFinger.

We should work to make maintaining that information convenient and safe. This would mean making it easy to associate data to a domain and control who can query it. Need a friend's email? Query their domain. Users would get to choose what's public and, if it's not public, which domains associated with a contact can access what they choose.

This would require associating additional data with a domain and permissions around that data — everything else should be open and extensible. You own a domain, you log into a registrar or an identity provider and manage structured, discoverable data and permissions. Want a public email address? List it. The same could be true of your name, an avatar and so forth.

All of this information could then be presented in and consumed as something akin to WebFinger. If you want to register with a platform application, authenticate with your domain or the email associated with your domain and grant the platform access to information associated with your domain of your choosing.

This *does* put registrars or hosts in the position of being identity providers but also gives users the agency to move from one provider to the next. Transfer the domain, transfer the identity information and move on.

In brief, what this would look like:

- A user obtains or is provided with a domain.
- The managing platform for that domain allows said user to associate information with the domain and choose how discoverable that information is and to whom.
- A user can register for a platform and authenticate with that domain, making information held by that provider available for discoverability.
  - Alternatively, users should be able to attach functionality to that domain should they so choose — think self-hosted vs. maintained applications.
- Connections made via a platform or service associated with the domain should be persisted by the domain provider. If users leave, that data is moved with them. The connection graph is moved up to the domain/identity provider and away from the consuming applications.
- Contact applications should support the protocol such that domains can be exchanged and information is then updated for users as it changes.
- Users control their data, platforms get equal access at the users' discretion.

We would be centralizing identity management behind a domain. We would keep that domain portable, preserving user control of said domain and the associated data. They could share as much or as little as they like. Platforms and applications could consume said data with the owner's consent and enrich it based on the connections made via those platforms or applications.

This is all, quite likely, a fantasy but you can see my read-only WebFinger data [here](/.well-known/webfinger).

[^1]: Your most durable and portable social graph are your contacts. Maintaining that information is the challenge.
