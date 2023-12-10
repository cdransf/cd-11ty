---
layout: default
title: Contact
meta:
  site:
    name: 'Cory Dransfeldt'
    description: "I'm a software developer in Camarillo, California. I enjoy hanging out with my beautiful family and 4 rescue dogs, technology, automation, music, writing, reading and tv and movies."
    url: https://coryd.dev
    logo:
      src: https://coryd.dev/assets/img/logo.webp
      width: 2000
      height: 2000
  language: en-US
  title: 'Cory Dransfeldt • Contact'
  description: 'How to contact me.'
  url: https://coryd.dev/contact
  image:
    src: https://coryd.dev/assets/img/avatar.webp
---

<h2
  class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mb-2"
>
  {{ title }}
</h2>

Fill out the form below to get in touch (or ping me on [Mastodon](https://social.lol/@cory) if you'd rather not use email).

<form class="mt-4 flex flex-col justify-center items-center w-full" method="POST" action="/contact/success" name="contact" netlify netlify-honeypot="bot-field">
  <label class="hidden">
    Don't fill this out if you're human: <input name="bot-field" />
  </label>
  <label class="w-full md:w-3/4">
    <span class="hidden">Name</span>
    <input type="text" name="name" placeholder="Name" class="w-full outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required />
  </label>
  <label class="w-full md:w-3/4">
    <span class="hidden">Email</span>
    <input type="email" name="email" placeholder="Email" class="w-full outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required />
  </label>
  <textarea name="message" placeholder="Message"  class="w-full md:w-3/4 h-40 resize-none outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required></textarea>
  <button class="pill--button w-1/2 md:w-1/3" type="submit">Send message</button>
</form>
