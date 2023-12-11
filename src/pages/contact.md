---
title: Contact
layout: default
permalink: /contact.html
description: 'How to contact me.'
---

<h2
  class="m-0 text-xl font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mb-2"
>
  {{ title }}
</h2>

<div class="flex flex-col md:flex-row">
  <div class="w-full md:w-1/2 md:pr-6">
    <p class="mt-0">Fill out the form to get in touch. Or I've got other options 👇🏻</p>
    <ul>
      <li>Ping me on <a href="https://social.lol/@cory">Mastodon</a></li>
      <li>Message me on Signal or iMessage (if you have my phone number)</li>
      <li><a href="mailto:{{ meta.authorEmail }}">Email me directly</a> if you have a client set up to use <code>mailto:</code> links</li>
      <li>File an issue on the appropriate repo over at <a href="https://github.com/cdransf">GitHub</a></li>
    </ul>
  </div>
  <form class="mt-3 md:mt-0 flex flex-col items-center justify-center w-full md:w-1/2" method="POST" action="/contact/success" name="contact" netlify netlify-honeypot="bot-field">
    <label class="hidden">
      Don't fill this out if you're human: <input name="bot-field" />
    </label>
    <label class="w-full">
      <span class="hidden">Name</span>
      <input type="text" name="name" placeholder="Name" class="w-full outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required />
    </label>
    <label class="w-full">
      <span class="hidden">Email</span>
      <input type="email" name="email" placeholder="Email" class="w-full outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required />
    </label>
    <textarea name="message" placeholder="Message"  class="w-full h-40 resize-none outline-none bg-white dark:bg-gray-900 p-2 mb-6 rounded-sm border border-blue-600 focus:border-blue-800 dark:border-blue-400 dark:focus:border-blue-200 transition-colors ease-in-out duration-300" required></textarea>
    <button class="pill--button w-1/2" type="submit">Send message</button>
  </form>
</div>
