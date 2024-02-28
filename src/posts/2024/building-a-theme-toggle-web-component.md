---
date: '2024-02-27'
title: 'Building a theme toggle web component'
description: "I (very recently!) added a theme toggle to my site, right up there in the menu. It's a shiny sun or a purple moon depending on your preference. It was a liquid template with some JavaScript sprinkled in. I turned that into a web component."
tags: ['CSS', 'javascript', 'web components', 'Eleventy']
---
I (very recently!) added a theme toggle to my site, right up there in the menu. It's a shiny sun or a purple moon depending on your preference. It was a liquid template with some JavaScript sprinkled in. I turned that into a web component.<!-- excerpt -->

Much like my `now-playing` component, I start out by registering the component template:

```javascript
const themeToggleTemplate = document.createElement('template')

themeToggleTemplate.innerHTML = `
  <button class="theme__toggle">
    <span class="light"></span>
    <span class="dark"></span>
  </button>
`

themeToggleTemplate.id = "theme-toggle-template"

if (!document.getElementById(themeToggleTemplate.id)) document.body.appendChild(themeToggleTemplate)
```

The template is generated with empty `light` and `dark` spans so that the clickable element (an icon or text) can be defined when it's implemented. Next, we register the tag name and create our `ThemeToggle` class:

```javascript
class ThemeToggle extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) customElements.define(tagName || "theme-toggle", ThemeToggle)
  }
```

My verbose, `connectedCallback` handles appending the template and appending theme behavior. The button included in the template is selected and cached and a `setTheme` method is defined, allowing the logic contained therein to be reused on load (with a simple boolean argument) and when the `theme-toggle` is clicked. It checks where the user `prefersDarkScheme`, sets the cached `currentTheme` accordingly and adds the appropriate class to the document body. The event listener attached to the `theme-toggle` toggles the body class and runs the `setTheme` function, skipping the logic that runs on load.

```javascript
async connectedCallback() {
    this.append(this.template)
    const btn = this.querySelector('.theme__toggle')
    const setTheme = (isOnLoad) => {
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      const currentTheme = localStorage?.getItem('theme')
      let theme
      if (!currentTheme) localStorage?.setItem('theme', (prefersDarkScheme ? 'dark' : 'light'))
      if (isOnLoad) {
        if (currentTheme === 'dark') {
          document.body.classList.add('theme__dark')
        } else if (currentTheme === 'light') {
          document.body.classList.add('theme__light')
        } else if (prefersDarkScheme) {
          document.body.classList.add('theme__dark')
        } else if (!prefersDarkScheme) {
          document.body.classList.add('theme__light')
        }
      }
      if (prefersDarkScheme) {
        theme = document.body.classList.contains('theme__light') ? 'light' : 'dark'
      } else {
        theme = document.body.classList.contains('theme__dark') ? 'dark' : 'light'
      }
      localStorage?.setItem('theme', theme)
    }

    setTheme(true);

    btn.addEventListener('click', () => {
      document.body.classList.toggle('theme__light')
      document.body.classList.toggle('theme__dark')
      setTheme()
    })
  }
```

The CSS for this is straightforward and contains a few vars specific to my implementation (related to icon color and SVG `stroke-width`):

```css
.theme__toggle svg {
  cursor: pointer;
}

.theme__toggle:hover,
.theme__toggle svg:hover {
  stroke-width: var(--stroke-width-bold);
}

.theme__toggle > .light svg { stroke: var(--sun) !important; }
.theme__toggle > .dark svg { stroke: var(--moon) !important; }

.theme__toggle > .light ,
.theme__toggle > .dark {
  display: none;
}

.theme__dark .theme__toggle > .light {
  display: inline;
}

.theme__dark .theme__toggle > .dark {
  display: none;
}

.theme__light .theme__toggle > .light {
  display: none;
}

.theme__light .theme__toggle > .dark {
  display: inline;
}
```

The final template that leverages the component looks like this:
{% raw %}
```liquid
<script type="module" src="/assets/scripts/components/theme-toggle.js"></script>
{% capture css %}
  {% render "../../../assets/styles/components/theme-toggle.css" %}
{% endcapture %}
<style>{{ css }}</style>
<template id="theme-toggle-template">
  <div class="theme__toggle">
    <span class="light">
      {% tablericon "sun" "Toggle light theme" %}
    </span>
    <span class="dark">
      {% tablericon "moon" "Toggle dark theme" %}
    </span>
  </div>
</template>
<li class="client-side">
  <theme-toggle></theme-toggle>
</li>
```
{% endraw %}

I load the web component script, embed my styles, define the template such that preferred icons are included using [Eleventy](https://www.11ty.dev/) shortcodes and the result is wrapped in an `li` to match the rest of my menu items, with `.client-side` added to hide the component should JavaScript be disabled.

[The complete JavaScript can be viewed in the source for my site.](https://github.com/cdransf/coryd.dev/blob/main/src/assets/scripts/components/theme-toggle.js)