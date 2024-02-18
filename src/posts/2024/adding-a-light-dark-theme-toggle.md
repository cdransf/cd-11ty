---
date: '2024-02-17'
title: 'Adding a light/dark theme toggle'
description: "I dropped a light/dark theme toggle into the navigation of my site, replacing the prior reliance on the visitor's preference set at the OS level (though it does still consider this preference)."
tags: ['CSS', 'JavaScript', 'Eleventy', 'development']
---
I dropped a light/dark theme toggle into the navigation of my site, replacing the prior reliance on the visitor's preference set at the OS level (though it does still consider this preference).<!-- excerpt -->

I built the button as a short Liquid partial:

{% raw %}
```liquid
<li class="theme__toggle client-side">
  <span class="placeholder">
    {% tablericon "placeholder" "Toggle theme placeholder" %}
  </span>
  <span class="light">
    {% tablericon "sun" "Toggle light theme" %}
  </span>
  <span class="dark">
    {% tablericon "moon" "Toggle dark theme" %}
  </span>
</li>
```
{% endraw %}

The `client-side` class above hides the button should the user have JavaScript disabled:

```html
<noscript>
  <style>
    .client-side {
      display: none
    }
  </style>
</noscript>
```

And JavaScript is used to control the behavior of the toggle:

```javascript
;(async function() {
  const btn = document.querySelector('.theme__toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches; // check the user's OS appearance preference
  const currentTheme = localStorage?.getItem('theme'); // check if a theme has been set
  let theme;

  if (!currentTheme) localStorage?.setItem('theme', (prefersDarkScheme ? 'dark' : 'light')) // if a theme hasn't been set, set one based on their OS preference

  // set the body class based on the derived preferences above
  if (currentTheme === 'dark') {
    document.body.classList.toggle('theme__dark');
  } else if (currentTheme === 'light') {
    document.body.classList.toggle('theme__light');
  } else if (prefersDarkScheme) {
    document.body.classList.toggle('theme__dark');
  } else if (!prefersDarkScheme) {
    document.body.classList.toggle('theme__light');
  }

  // allow the user to toggle the theme by clicking the theme button
  btn.addEventListener('click', () => {
    document.body.classList.toggle('theme__light');
    document.body.classList.toggle('theme__dark');

    if (prefersDarkScheme) {
      theme = document.body.classList.contains('theme__light') ? 'light' : 'dark';
    } else {
      theme = document.body.classList.contains('theme__dark') ? 'dark' : 'light';
    }
    localStorage?.setItem('theme', theme);
  });
})()
```

Finally, the theme is updated based on the body class applied by the JavaScript, updating the variable values that define my site's theme:

```css
/* theme toggle */
.theme__toggle,
.theme__toggle svg {
  cursor: pointer;
}

.theme__toggle > .light svg { stroke: var(--sun) !important; }
.theme__toggle > .dark svg { stroke: var(--moon) !important; }

.theme__toggle > .light ,
.theme__toggle > .dark {
  display: none;
}

:is(.theme__light, .theme__dark) .theme__toggle > .placeholder {
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
...
:root body.theme__light {
  --text-color: var(--color-darkest);
  --background-color: var(--color-lightest);
  --text-color-inverted: var(--color-lightest);
  --background-color-inverted: var(--color-darkest);
  --accent-color: var(--blue-600);
  --accent-color-hover: var(--blue-800);
  --selection-color: var(--accent-color);
  --gray-light: var(--gray-200);
  --gray-lighter: var(--gray-50);
  --gray-dark: var(--gray-700);
  --brand-github: #333;
}

:root body.theme__dark {
  --text-color: var(--color-lightest);
  --background-color: var(--color-darkest);
  --text-color-inverted: var(--color-darkest);
  --background-color-inverted: var(--color-lightest);
  --accent-color: var(--blue-400);
  --accent-color-hover: var(--blue-200);
  --gray-light: var(--gray-900);
  --gray-lighter: var(--gray-950);
  --gray-dark: var(--gray-300);
  --brand-github: #f5f5f5;
}
```

With those changes in place, visitors can toggle whichever theme they'd prefer and their preference is persisted in `localStorage` should it be available.