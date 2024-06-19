window.addEventListener('load', () => {
  const menuInput = document.getElementById('menu-toggle')
  const menuButtonContainer = document.querySelector('.menu-button-container')
  const menuItems = document.querySelectorAll('.menu-primary li[role="menu-item"]')
  const isMobile = () => window.innerWidth <= 768

  const updateTabIndex = () => {
    const isExpanded = menuInput.checked
    menuButtonContainer.setAttribute('aria-expanded', isExpanded)

    menuItems.forEach(item => {
      const link = item.querySelector('a')
      if (link) link.setAttribute('tabindex', isMobile() && !isExpanded ? '-1' : '0')
    })
  }

  updateTabIndex()

  menuInput.addEventListener('change', updateTabIndex)

  menuButtonContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      menuInput.checked = !menuInput.checked
      updateTabIndex()
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
      updateTabIndex()
    }
  })
})