window.addEventListener('load', () => {
  ;(() => {
    if (!MiniSearch) return
    const miniSearch = new MiniSearch({
      fields: ['title', 'text', 'tags', 'type'],
    })

    const $form = document.querySelector('.search__form')
    const $input = document.querySelector('.search__form--input')
    const $fallback = document.querySelector('.search__form--fallback')
    const $typeCheckboxes = document.querySelectorAll('.search__form--type input[type="checkbox"]')
    const $results = document.querySelector('.search__results')
    const $loadMoreButton = document.querySelector('.search__load-more')

    $form.removeAttribute('action')
    $form.removeAttribute('method')
    $fallback.remove()

    const PAGE_SIZE = 10
    let currentPage = 1
    let currentResults = []

    const loadSearchIndex = async () => {
      try {
        const response = await fetch('/api/search')
        const index = await response.json()
        const resultsById = index.reduce((byId, result) => {
          byId[result.id] = result
          return byId
        }, {})
        miniSearch.addAll(index)
        return resultsById
      } catch (error) {
        console.error('Error fetching search index:', error)
        return {}
      }
    }

    let resultsById = {}
    let debounceTimeout

    loadSearchIndex().then(loadedResultsById => resultsById = loadedResultsById)

    const getSelectedTypes = () => {
      return Array.from($typeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)
    }

    $input.addEventListener('input', () => {
      const query = $input.value

      clearTimeout(debounceTimeout)

      if (query.length === 0) {
        renderSearchResults([])
        $loadMoreButton.style.display = 'none'
        return
      }

      debounceTimeout = setTimeout(() => {
        const results = (query.length > 1) ? getSearchResults(query) : []
        currentResults = results
        currentPage = 1

        renderSearchResults(getResultsForPage(currentPage))
        $loadMoreButton.style.display = results.length > PAGE_SIZE ? 'block' : 'none'
      }, 300)
    })

    $input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') event.preventDefault()
    })

    $typeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const query = $input.value
        const results = getSearchResults(query)
        currentResults = results
        currentPage = 1

        renderSearchResults(getResultsForPage(currentPage))
        $loadMoreButton.style.display = results.length > PAGE_SIZE ? 'block' : 'none'
      })
    })

    $loadMoreButton.addEventListener('click', () => {
      currentPage++
      const nextResults = getResultsForPage(currentPage)
      appendSearchResults(nextResults)

      if (currentPage * PAGE_SIZE >= currentResults.length) $loadMoreButton.style.display = 'none'
    })

    const getSearchResults = (query) => {
      const selectedTypes = getSelectedTypes()

      return miniSearch.search(query, { prefix: true, fuzzy: 0.2, boost: { title: 2 } })
        .map(({ id }) => resultsById[id])
        .filter(result => selectedTypes.includes(result.type))
    }

    const getResultsForPage = (page) => {
      const start = (page - 1) * PAGE_SIZE
      const end = page * PAGE_SIZE
      return currentResults.slice(start, end)
    }

    const parseMarkdown = (markdown) => {
      if (!markdown) return ''
      markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>')
      markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      markdown = markdown.replace(/\n/g, '<br>')
      markdown = markdown.replace(/[#*_~`]/g, '')
      return markdown
    }

    const truncateDescription = (markdown, maxLength = 150) => {
      const htmlDescription = parseMarkdown(markdown)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlDescription
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      if (plainText.length > maxLength) return plainText.substring(0, maxLength) + '...'
      return plainText
    }

    const formatArtistTitle = (title, totalPlays) => {
      if (totalPlays > 0) return `${title} <strong class="highlight-text">${totalPlays} plays</strong>`
      return `${title}`
    }

    const renderSearchResults = (results) => {
      if (results.length > 0) {
        $results.innerHTML = results.map(({ title, url, description, type, total_plays }) => {
          const truncatedDesc = truncateDescription(description)
          let formattedTitle = title

          if (type === 'artist' && total_plays !== undefined) formattedTitle = formatArtistTitle(title, total_plays)

          return `
            <li class="search__results--result">
              <a href="${url}">
                <h3>${formattedTitle}</h3>
              </a>
              <p>${truncatedDesc}</p>
            </li>
          `
        }).join('\n')
        $results.style.display = 'block'
      } else {
        $results.innerHTML = '<li class="search__results--no-results">No results found.</li>'
        $results.style.display = 'block'
      }
    }

    const appendSearchResults = (results) => {
      const newResults = results.map(({ title, url, description, type, total_plays }) => {
        const truncatedDesc = truncateDescription(description)
        let formattedTitle = title

        if (type === 'artist' && total_plays !== undefined) formattedTitle = formatArtistTitle(title, total_plays)

        return `
          <li class="search__results--result">
            <a href="${url}">
              <h3>${formattedTitle}</h3>
            </a>
            <p>${truncatedDesc}</p>
          </li>
        `
      }).join('\n')
      $results.insertAdjacentHTML('beforeend', newResults)
    }
  })()
})