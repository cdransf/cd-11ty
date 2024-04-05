window.onload = () => {
  const initializeButtonSet = (buttonSet) => {
    const buttons = buttonSet.querySelectorAll('button')
    const buttonIds = Array.from(buttons).map(button => button.getAttribute('data-toggle'))

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-toggle')
        const targetContent = document.getElementById(targetId)

        buttons.forEach(btn => {
          btn.classList.remove('active')
          btn.classList.add('secondary')
        })

        buttonIds.forEach(id => {
          document.getElementById(id).classList.add('hidden')
        })

        this.classList.remove('secondary')
        this.classList.add('active')

        targetContent.classList.remove('hidden')
      })
    })
  }

  const buttonSets = document.querySelectorAll('.now__section--header-buttons')
  buttonSets.forEach(initializeButtonSet)
}