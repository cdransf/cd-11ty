window.addEventListener('load', () => {
  const button = document.querySelector('[data-toggle-button]')
  const content = document.querySelector('[data-toggle-content]')
  const text = document.querySelectorAll('[data-toggle-content] p')
  const minHeight = 500 // this needs to match the height set on [data-toggle-content].text-toggle-hidden in text-toggle.css
  let interiorHeight = 0

  text.forEach(node => interiorHeight += node.scrollHeight)

  if (interiorHeight < minHeight) {
    content.classList.remove('text-toggle-hidden')
    button.style.display = 'none'
  }

  button.addEventListener('click', () => {
    if (content.classList.contains('text-toggle-hidden')) {
      content.classList.remove('text-toggle-hidden')
      button.textContent = 'Show less'
    } else {
      content.classList.add('text-toggle-hidden')
      button.textContent = 'Show more'
    }
  });
})