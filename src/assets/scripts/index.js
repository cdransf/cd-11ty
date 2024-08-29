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
    });

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

  // modal keyboard controls
  ;(() => {
    const modalInputs = document.querySelectorAll('.modal-input')

    if (!modalInputs) return // early return if dom nodes are missing

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalInputs.forEach((modalInput) => {
          if (modalInput.checked) modalInput.checked = false
        })
      }
    })
  })()

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
    }

    button.addEventListener('click', () => {
      const isHidden = content.classList.toggle('text-toggle-hidden')
      button.textContent = isHidden ? 'Show more' : 'Show less'
    })
  })
})