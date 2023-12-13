---
date: '2014-10-15'
title: 'External links and redirects in Statamic navigation'
description: "I put together a fieldset and template that allows external links to be added to the navigation of Statamic sites alongside internal links."
draft: false
tags: ['development', 'Statamic']
---

I put together a fieldset and template that allows external links to be added to the navigation of Statamic sites alongside internal links.<!-- excerpt --> To implement this in your site, the fieldset should look like the following:

```yaml
title: Nav link
fields:
link:
display: Link
required: true
default:
type: text
content:
```

This fieldset should be accompanied by a template named link.html which will need to be added to your site's theme. The contents of the template are simply Statamic's [redirect example](http://www.statamic.com/learn/documentation/tags/redirect).

Now you should be able to create link pages in your Statamic admin panel that can then be added to your site's navigation. The pages created in the panel should create page files that look like the following:

```yaml
title: Example link page
fieldset: link
template: link
link: https://example.com
```

Is there an easier or more effective way to do this? [Let me know.](mailto:cory.dransfeldt@gmail.com)
