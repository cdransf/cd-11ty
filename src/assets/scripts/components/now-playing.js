const nowPlayingTemplate = document.createElement('template')

nowPlayingTemplate.innerHTML = `
  <p class="client-side">
    <span class="text--blurred fade" data-key="loading">🎧 Album by Artist</span>
    <span>
      <span class="fade" data-key="content" style="opacity:0"></span>
    </span>
  </p>
`
nowPlayingTemplate.id = "now-playing-template"

if (!document.getElementById(nowPlayingTemplate.id)) document.body.appendChild(nowPlayingTemplate)

class NowPlaying extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) customElements.define(tagName || "now-playing", NowPlaying);
  }

  async connectedCallback() {
    this.append(this.template);
    const data = { ...(await this.data) };
    const loading = this.querySelector('[data-key="loading"]')
    const content = this.querySelector('[data-key="content"]')
    const value = data['content']

    loading.style.opacity = '0'
    content.style.opacity = '1'
    loading.style.display = 'none'
    content.innerHTML = value
  }

  get template() {
    return document.getElementById(nowPlayingTemplate.id).content.cloneNode(true);
  }

  get data() {
    return fetch('/api/now-playing', { type: 'json' }).then((data) => data.json()).catch((e) => {})
  }
}

NowPlaying.register();