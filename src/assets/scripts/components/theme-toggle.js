const themeToggleTemplate = document.createElement('template')

themeToggleTemplate.innerHTML = `
  <button class="theme__toggle">
    <span class="light"></span>
    <span class="dark"></span>
  </button>
`

themeToggleTemplate.id = "theme-toggle-template"

if (!document.getElementById(themeToggleTemplate.id)) document.body.appendChild(themeToggleTemplate)

class ThemeToggle extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) customElements.define(tagName || "theme-toggle", ThemeToggle)
  }

  async connectedCallback() {
    this.append(this.template)
    const btn = this.querySelector('.theme__toggle')
    const setTheme = (isOnLoad) => {
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      const currentTheme = localStorage?.getItem('theme')
      let theme
      if (!currentTheme) localStorage?.setItem('theme', (prefersDarkScheme ? 'dark' : 'light'))
      if (isOnLoad) {
        if (currentTheme === 'dark') {
          document.body.classList.add('theme__dark')
        } else if (currentTheme === 'light') {
          document.body.classList.add('theme__light')
        } else if (prefersDarkScheme) {
          document.body.classList.add('theme__dark')
        } else if (!prefersDarkScheme) {
          document.body.classList.add('theme__light')
        }
      }
      if (prefersDarkScheme) {
        theme = document.body.classList.contains('theme__light') ? 'light' : 'dark'
      } else {
        theme = document.body.classList.contains('theme__dark') ? 'dark' : 'light'
      }
      localStorage?.setItem('theme', theme)
    }

    setTheme(true);

    btn.addEventListener('click', () => {
      document.body.classList.toggle('theme__light')
      document.body.classList.toggle('theme__dark')
      setTheme()
    })
  }

  get template() {
    return document.getElementById(themeToggleTemplate.id).content.cloneNode(true)
  }
}

ThemeToggle.register()