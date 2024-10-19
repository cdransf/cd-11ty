class SelectPagination extends HTMLElement {
  static register(tagName = 'select-pagination') {
    if ("customElements" in window) customElements.define(tagName, this)
  }

  static get observedAttributes() {
    return ['data-base-index']
  }

  get baseIndex() {
    return this.getAttribute('data-base-index') || 0
  }

  connectedCallback() {
    if (this.shadowRoot) return

    this.attachShadow({ mode: 'open' }).appendChild(document.createElement('slot'))

    const uriSegments = window.location.pathname.split('/').filter(Boolean)
    let pageNumber = this.extractPageNumber(uriSegments) || 0

    this.control = this.querySelector('select')
    this.control.value = pageNumber
    this.control.addEventListener('change', (event) => {
      pageNumber = parseInt(event.target.value)
      const updatedUrlSegments = this.updateUrlSegments(uriSegments, pageNumber)
      window.location.href = `${window.location.origin}/${updatedUrlSegments.join('/')}`
    })
  }

  extractPageNumber(segments) {
    const lastSegment = segments[segments.length - 1]
    return !isNaN(lastSegment) ? parseInt(lastSegment) : null
  }

  updateUrlSegments(segments, pageNumber) {
    if (!isNaN(segments[segments.length - 1])) {
      segments[segments.length - 1] = pageNumber.toString()
    } else {
      segments.push(pageNumber.toString())
    }

    if (pageNumber === parseInt(this.baseIndex)) segments.pop()
    return segments
  }
}

SelectPagination.register()