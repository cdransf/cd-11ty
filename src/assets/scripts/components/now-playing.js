class NowPlaying extends HTMLElement {
  static tagName = 'now-playing'

  static register(tagName, registry) {
    if(!registry && ('customElements' in globalThis)) {
      registry = globalThis.customElements;
    }
    registry?.define(tagName || this.tagName, this);
  }

  static attr = {
    url: 'api-url'
  }

  get url() {
    return this.getAttribute(NowPlaying.attr.url) || '';
  }

  async connectedCallback() {
    if (this.shadowRoot) return;
    const data = { ...(await this.data) };
    let shadowroot = this.attachShadow({ mode: 'open' })
    let slot = document.createElement('slot')
    shadowroot.appendChild(slot)

    const loading = this.querySelector('.loading')
    const content = this.querySelector('.content')
    const value = data['content']

    if (!value) {
      loading.style.display = 'none'
      content.style.display = 'none'
    }

    if (value) {
      loading.style.opacity = '0'
      loading.style.display = 'none'
      content.style.opacity = '1'
      content.innerHTML = value
    }
  }

  get data() {
    return fetch(this.url, { type: 'json' }).then((data) => data.json()).catch((e) => {})
  }
}

NowPlaying.register();