window.addEventListener('load', () => {
    const buttonSets = document.querySelectorAll('.section-header-buttons')
    const initializeButtonSet = (buttonSet) => {
      const buttons = buttonSet.querySelectorAll('button')
      const buttonIds = Array.from(buttons).map((button) => button.getAttribute('data-toggle'))

      buttons.forEach(button => {
        button.addEventListener('click', function () {
          const targetId = this.getAttribute('data-toggle')
          const targetContent = document.getElementById(targetId)

          buttons.forEach(btn => {
            btn.classList.toggle('active', btn === this)
            btn.classList.toggle('secondary', btn !== this)
          })

          buttonIds.forEach(id => {
            document.getElementById(id).classList.toggle('hidden', id !== targetId)
          })

          targetContent.classList.remove('hidden')
        })
      })
    }

    buttonSets.forEach(initializeButtonSet)
})