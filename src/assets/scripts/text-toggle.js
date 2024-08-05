window.addEventListener('load', () => {
  const button = document.querySelector('[data-toggle-button]')
    const content = document.querySelector('[data-toggle-content]')
    const text = document.querySelectorAll('[data-toggle-content] p')
    const minHeight = 500 // this needs to match the height set on [data-toggle-content].text-toggle-hidden in text-toggle.css
    const interiorHeight = Array.from(text).reduce((acc, node) => acc + node.scrollHeight, 0)

    if (interiorHeight < minHeight) {
      content.classList.remove('text-toggle-hidden')
      button.style.display = 'none'
    }

    button.addEventListener('click', () => {
      const isHidden = content.classList.toggle('text-toggle-hidden')
      button.textContent = isHidden ? 'Show more' : 'Show less'
    })
})