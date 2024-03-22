(() => {
  const miniSearch = new MiniSearch({
    fields: ['title', 'text', 'tags']
  })

  const $form = document.querySelector('.search__form')
  const $input = document.querySelector('.search__form--input')
  const $fallback = document.querySelector('.search__form--fallback')
  const $results = document.querySelector('.search__results')

  // remove noscript fallbacks
  $form.removeAttribute('action')
  $form.removeAttribute('method')
  $fallback.remove()

  let resultsById = {}

  // fetch index
  fetch('/api/search').then(response => response.json())
  .then((results) => {
    resultsById = results.reduce((byId, result) => {
      byId[result.id] = result
      return byId
    }, {})
    return miniSearch.addAll(results)
  })

  $input.addEventListener('input', () => {
    const query = $input.value
    const results = (query.length > 1) ? getSearchResults(query) : []
    if (query === '') renderSearchResults([])
    if (results && plausible) plausible(`Search query: ${query}`)
    renderSearchResults(results)
  })

  const getSearchResults = (query) => miniSearch.search(query, { prefix: true, fuzzy: 0.2, boost: { title: 2 } }).map(({ id }) => resultsById[id])
  const renderSearchResults = (results) => {
    $results.innerHTML = results.map(({ title, url }) => {
      return `<li class="search__results--result"><a href="${url}">${title}</a></li>`
    }).join('\n')

    if (results.length > 0) {
      $results.classList.remove('hidden')
    } else {
      $results.classList.add('hidden')
    }
  }
})();