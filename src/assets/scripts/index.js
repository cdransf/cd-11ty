window.addEventListener('load', () => {
  // menu keyboard controls
  ;(() => {
    const menuInput = document.getElementById('menu-toggle')
    const menuButtonContainer = document.querySelector('.menu-button-container')
    const menuItems = document.querySelectorAll('.menu-primary li')

    menuButtonContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        menuInput.checked = !menuInput.checked
      }
    })

    menuItems.forEach((item) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          item.querySelector('a').click()
        }
      })
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuInput.checked) menuInput.checked = false
    })
  })()

  // modal keyboard controls and scroll management
  ;(() => {
    const modalInputs = document.querySelectorAll('.modal-input')
    if (!modalInputs) return

    const toggleBodyScroll = (disableScroll) => {
      if (disableScroll) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const checkModals = () => {
      let isAnyModalOpen = false
      modalInputs.forEach((modalInput) => {
        if (modalInput.checked) isAnyModalOpen = true
      })
      toggleBodyScroll(isAnyModalOpen)
    }

    modalInputs.forEach((modalInput) => {
      modalInput.addEventListener('change', checkModals)
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalInputs.forEach((modalInput) => {
          if (modalInput.checked) modalInput.checked = false
        })
        toggleBodyScroll(false)
      }
    })

    checkModals()
  })()

  // text toggle for media pages
  ;(() => {
    const button = document.querySelector('[data-toggle-button]')
    const content = document.querySelector('[data-toggle-content]')
    const text = document.querySelectorAll('[data-toggle-content] p')
    const minHeight = 500 // this needs to match the height set on [data-toggle-content].text-toggle-hidden in text-toggle.css
    const interiorHeight = Array.from(text).reduce((acc, node) => acc + node.scrollHeight, 0)

    if (!button || !content || !text) return

    if (interiorHeight < minHeight) {
      content.classList.remove('text-toggle-hidden')
      button.style.display = 'none'
      return
    }

    button.addEventListener('click', () => {
      const isHidden = content.classList.toggle('text-toggle-hidden')
      button.textContent = isHidden ? 'Show more' : 'Show less'
    })
  })()

  // search logic
  ;(() => {
    if (!MiniSearch) return

    const miniSearch = new MiniSearch({ fields: ['title', 'description', 'tags', 'type'] })
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
    let resultsById = {}
    let debounceTimeout

    const parseMarkdown = markdown => {
      if (!markdown) return ''
      return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>')
        .replace(/[#*_~`]/g, '')
    }

    const truncateDescription = (markdown, maxLength = 150) => {
      const htmlDescription = parseMarkdown(markdown)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlDescription
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      return plainText.length > maxLength ? `${plainText.substring(0, maxLength)}...` : plainText
    }

    const formatArtistTitle = (title, totalPlays) =>
      totalPlays > 0 ? `${title} <strong class="highlight-text">${totalPlays} plays</strong>` : title

    const renderSearchResults = results => {
      if (results.length > 0) {
        $results.innerHTML = results.map(({ title, url, description, type, total_plays }) => {
          const truncatedDesc = truncateDescription(description)
          const formattedTitle = type === 'artist' && total_plays !== undefined
            ? formatArtistTitle(title, total_plays)
            : title

          return `
            <li class="search__results--result">
              <a href="${url}">
                <h3>${formattedTitle}</h3>
              </a>
              <p>${truncatedDesc}</p>
            </li>
          `
        }).join('')
        $results.style.display = 'block'
      } else {
        $results.innerHTML = '<li class="search__results--no-results">No results found.</li>'
        $results.style.display = 'block'
      }
    }

    const appendSearchResults = results => {
      const newResults = results.map(({ title, url, description, type, total_plays }) => {
        const truncatedDesc = truncateDescription(description)
        const formattedTitle = type === 'artist' && total_plays !== undefined
          ? formatArtistTitle(title, total_plays)
          : title

        return `
          <li class="search__results--result">
            <a href="${url}">
              <h3>${formattedTitle}</h3>
            </a>
            <p>${truncatedDesc}</p>
          </li>
        `
      }).join('')
      $results.insertAdjacentHTML('beforeend', newResults)
    }

    const loadSearchIndex = async (query = '', types = []) => {
      const typeQuery = types.join(',')
      const response = await fetch(`https://coryd.dev/api/search?q=${query}&type=${typeQuery}`)
      const index = await response.json()

      resultsById = index.reduce((byId, result) => {
        byId[result.id] = result
        return byId
      }, {})

      miniSearch.removeAll()
      miniSearch.addAll(index)
      return resultsById
    }

    loadSearchIndex().then(loadedResultsById => resultsById = loadedResultsById)

    const getSelectedTypes = () =>
      Array.from($typeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)

    $input.addEventListener('input', () => {
      const query = $input.value.trim()
      clearTimeout(debounceTimeout)

      if (!query) {
        renderSearchResults([])
        $loadMoreButton.style.display = 'none'
        return
      }

      debounceTimeout = setTimeout(async () => {
        resultsById = await loadSearchIndex(query, getSelectedTypes())
        const results = getSearchResults(query)
        currentResults = results
        currentPage = 1

        renderSearchResults(getResultsForPage(currentPage))
        $loadMoreButton.style.display = results.length > PAGE_SIZE ? 'block' : 'none'
      }, 300)
    })

    $typeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', async () => {
        resultsById = await loadSearchIndex($input.value.trim(), getSelectedTypes())
        const results = getSearchResults($input.value.trim())
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

    const getSearchResults = query =>
      miniSearch.search(query, { prefix: true, fuzzy: 0.2, boost: { title: 2 } })
        .map(({ id }) => resultsById[id])
        .filter(result => getSelectedTypes().includes(result.type))

    const getResultsForPage = page =>
      currentResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  })()
})