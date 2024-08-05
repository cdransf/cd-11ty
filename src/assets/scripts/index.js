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
})