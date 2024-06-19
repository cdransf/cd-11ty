window.addEventListener('load', () => {
  const menuInput = document.getElementById('menu-toggle')
  const menuLabelText = document.getElementById('menu-label-text')
  const menuButtonContainer = document.querySelector('.menu-button-container')
  const menuItems = document.querySelectorAll('.menu-primary li[role="menu-item"]')
  const isMobile = () => window.innerWidth <= 768

  const udpateMenuState = () => {
    const isExpanded = menuInput.checked
    menuButtonContainer.setAttribute('aria-expanded', isExpanded)

    if(isExpanded) menuLabelText.textContent = 'Close mobile menu'
    if (!isExpanded) menuLabelText.textContent = 'Open mobile menu'
  }

  udpateMenuState()

  menuInput.addEventListener('change', udpateMenuState)

  menuButtonContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      menuInput.checked = !menuInput.checked
      udpateMenuState()
    }
  })

  menuItems.forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        item.querySelector('a').click()
      }
    })
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isMobile() && menuInput.checked) {
      menuInput.checked = false
      udpateMenuState()
    }
  })
})