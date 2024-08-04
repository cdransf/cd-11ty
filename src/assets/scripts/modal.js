window.addEventListener('load', () => {
  const modalInputs = document.querySelectorAll('.modal-input')
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modalInputs.forEach(modalInput => {
      if (modalInput.checked) modalInput.checked = false
    })
  })
})