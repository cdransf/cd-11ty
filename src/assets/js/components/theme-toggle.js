class ThemeToggle extends HTMLElement {
  static tagName = 'theme-toggle'

  static register(tagName = this.tagName, registry = globalThis.customElements) {
    registry.define(tagName, this)
  }

  connectedCallback() {
    if (this.shadowRoot) return
    this.attachShadow({ mode: 'open' }).appendChild(document.createElement('slot'))
    this.root = document.documentElement
    this.button = this.querySelector('button')
    this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    this.currentTheme = sessionStorage.getItem('theme')

    this.setTheme()

    this.button.addEventListener('click', () => this.toggleTheme())
    this.prefersDarkScheme.addEventListener('change', (event) => this.onPreferredColorSchemeChange(event))
  }

  setTheme() {
    if (!this.currentTheme) {
      this.currentTheme = this.prefersDarkScheme.matches ? 'dark' : 'light'
    }

    this.theme = this.currentTheme
    this.root.setAttribute('data-theme', this.theme)
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    sessionStorage.setItem('theme', this.currentTheme)
    this.setTheme()
  }

  onPreferredColorSchemeChange(event) {
    if (!sessionStorage.getItem('theme')) {
      this.currentTheme = event.matches ? 'dark' : 'light'
      this.setTheme()
    }
  }
}

ThemeToggle.register()