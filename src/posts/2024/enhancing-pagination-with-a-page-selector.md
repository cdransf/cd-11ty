---
date: '2024-04-05T10:00-08:00'
title: 'Enhancing pagination with a page selector'
description: "I've made a change to my site's pagination wherein I've enhanced the page count displayed at the bottom of my home and links pages to display the page count in a select element. The select displays a list of all the pages and navigates to the selected page."
tags: ['Eleventy', 'development', 'javascript']
---
I've made a change to my site's pagination wherein I've enhanced the page count displayed at the bottom of my home and links pages to display the page count in a select element. The select displays a list of all the pages and navigates to the selected page.<!-- excerpt -->

If a user does not have JavaScript enabled, it simply renders the old static page count. The JavaScript logic looks like the following:

```javascript
window.onload = () => {
  const pagination = document.getElementById('pagination')
  const uri = window.location.pathname
  const urlSegments = uri.split('/').filter(segment => segment !== '')
  let pageNumber = parseInt(urlSegments[urlSegments.length - 1]) || 0
  pagination.querySelector(`option[value="${pageNumber.toString()}"]`).setAttribute('selected', 'selected')

  if (pagination) {
    pagination.addEventListener('change', (event) => {
      pageNumber = event.target.value

      if (urlSegments.length === 0 || isNaN(urlSegments[urlSegments.length - 1])) {
        urlSegments.push(pageNumber.toString())
      } else {
        urlSegments[urlSegments.length - 1] = pageNumber.toString()
      }

      if (pageNumber === 0) {
        window.location.href = `${window.location.protocol}//${window.location.host}/`
      } else {
        window.location = `${window.location.protocol}//${window.location.host}/${urlSegments.join('/')}`
      }
    })
  }
}
```

We wait for the document to load, select the pagination DOM node, get the current `pathname`, split it at '/' delimited segments, filter empty values and look for a number representing the current page. We then set the `selected` attribute on the appropriate `<option>` node for the current page.

  Within the `change` event listener I check whether we've extracted a url segment *and* that the last segment is a valid number — if not, we add a new numeric segment. If it is numeric, we replace it with the new page number. Finally, we have special handling for the root section — because my first page is at `/` and the second is at `/1/` we need to correctly navigate the user should the pageNumber be `0`.

  With that, we have quicker and more convenient page navigation for users that have JavaScript enabled and a handy page count for users that have disabled JavaScript in their browser.