window.onload = () => {
  const button = document.querySelector('[data-toggle-button]')
  const content = document.querySelector('[data-toggle-content]')

  button.addEventListener('click', () => {
    if (content.classList.contains('text-toggle-hidden')) {
      content.classList.remove('text-toggle-hidden')
      button.textContent = 'Show less'
    } else {
      content.classList.add('text-toggle-hidden')
      button.textContent = 'Show more'
    }
  });
}