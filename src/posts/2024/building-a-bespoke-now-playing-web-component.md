---
date: '2024-02-21'
title: 'Building a bespoke now-playing web component'
description: "I've long had a now playing element on the home page of my site that displays either what I've checked into on Trakt, the Lakers' record and who they're playing when a game is on or the last song I've listened to. After leveraging some new web components on my site, I decided to refactor the code powering this into a web component specific to my needs."
tags: ['development', 'javascript', 'Eleventy']
---
I've long had a now playing element on the home page of my site that displays either what I've checked into on Trakt, the Lakers' record and who they're playing when a game is on or the last song I've listened to. After leveraging some new web components on my site, I decided to refactor the code powering this into a web component specific to my needs.<!-- excerpt -->

I start by creating the template for the component and setting the `id` before then adding it to the document body:

```javascript
const nowPlayingTemplate = document.createElement('template')

nowPlayingTemplate.innerHTML = `
  <p>
    <span class="text--blurred" data-key="loading">🎧 Album by Artist</span>
    <span>
      <span data-key="content" style="opacity:0"></span>
    </span>
  </p>
`

nowPlayingTemplate.id = "now-playing-template"

if (!document.getElementById(nowPlayingTemplate.id)) document.body.appendChild(nowPlayingTemplate)
```

Next, I define the `NowPlaying` class and register the custom element:

```javascript
class NowPlaying extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) {
      customElements.define(tagName || "now-playing", NowPlaying);
    }
  }
...
```

Next, in the `connectedCallback()` method, we handle appending the template to the `NowPlaying` element and populate the data for the component:

```javascript
async connectedCallback() {
  this.append(this.template);
  const data = { ...(await this.data) };
  const loading = this.querySelector('[data-key="loading"]')
  const content = this.querySelector('[data-key="content"]')
  const value = data['content']

  loading.style.opacity = '0'
  loading.style.display = 'none'
  content.style.opacity = '1'
  content.innerHTML = value
}
```

The logic here is quite straightforward. It appends the template to the custom element, fetches the data from my `/api/now-playing` endpoint, caches query selectors for the component and then sets opacity, display styles and component content.

The `fade` class that animates component loading is as follows:

```css
/* transitions */
--transition-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--transition-duration-default: 300ms;
...
.fade {
  transition-property: opacity;
  transition-timing-function: var(--transition-ease-in-out);
  transition-duration: var(--transition-duration-default);
}
```

The component is then included via a `playing.liquid` template:
{% raw %}
```liquid
<script type="module" src="/assets/scripts/components/now-playing.js"></script>
<now-playing></now-playing>
```
{% endraw %}

Now, instead of having a separate template for the component and script, I'm able to quite simply consolidate the two and provide the same experience. You can view the full source of the component [here](https://github.com/cdransf/coryd.dev/blob/main/src/assets/scripts/components/now-playing.js) and the source of the edge function powering the `/api/now-playing` endpoint [here](https://github.com/cdransf/coryd.dev/blob/main/netlify/edge-functions/now-playing.js).

Building this first component was pretty straightforward and, frankly, fun — it encapsulates the rendering logic and data fetching in one place without any external dependencies.