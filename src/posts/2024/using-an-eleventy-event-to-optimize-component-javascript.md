---
date: '2024-03-10'
title: 'Using an Eleventy event to optimise component JavaScript'
description: "I've added a small event to optimize web component JavaScript when my site builds."
tags: ['development', 'javascript', 'Eleventy']
---
My site leverages a number of web component for functionality on my site. Namely: mastodon post embeds, search, my now playing component, my theme toggle, post sharing and YouTube embeds. It's all loaded on pages only as needed but, I wanted to make sure it was all minified.

So, I've created this event in `events/index.js`:

```javascript
export const minifyJsComponents = async () => {
  const jsComponentsDir = '_site/assets/scripts/components'; // the directory my component js is copied to
  const files = fs.readdirSync(jsComponentsDir);
  for (const fileName of files) {
    if (fileName.endsWith('.js')) {
      const filePath = `${jsComponentsDir}/${fileName}`;
      const minified = await minify(fs.readFileSync(filePath, 'utf8'));
      fs.writeFileSync(filePath, minified.code);
    } else {
      console.log('⚠ No js components found')
    }
  }
}
```

Which is then run in my `.eleventy.js` file: `eleventyConfig.on('afterBuild', minifyJsComponents)`.