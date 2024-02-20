const nowPlayingTemplate = document.createElement('template')

nowPlayingTemplate.innerHTML = `
  <p class="client-side">
    <span class="text--blurred" data-key="loading">🎧 Album by Artist</span>
    <span>
      <span data-key="content" style="opacity:0"></span>
    </span>
  </p>
`

nowPlayingTemplate.id = "now-playing-template"

if (!document.getElementById(nowPlayingTemplate.id)) document.body.appendChild(nowPlayingTemplate)

class NowPlaying extends HTMLElement {
  static register(tagName) {
    if ("customElements" in window) {
      customElements.define(tagName || "now-playing", NowPlaying);
    }
  }

  async connectedCallback() {
    this.append(this.template);
    const data = { ...(await this.data) };
    const populateNowPlaying = (component, data, cache) => {
      component.querySelectorAll("[data-key]").forEach(async (slot) => {
        const { key } = slot.dataset
        const value = data[key]

        if (cache) {
          if (key === 'loading') {
            slot.style.opacity = '0'
            slot.style.display = 'none'
          } else if (key === 'content') {
            slot.innerHTML = value
            slot.style.opacity = '1'
          }
        }

        if (!cache) {
          if (key === 'loading') {
            slot.classList.add('fade')
            slot.style.opacity = '0'
            setTimeout(() => {
              slot.style.display = 'none'
            }, 300);
          } else if (key === 'content') {
            slot.classList.add('fade')
            setTimeout(() => {
              slot.innerHTML = value
              slot.style.opacity = '1'
            }, 300);
          }
        }
      })
    }

    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) populateNowPlaying(this, cache, true)
    } catch (e) {}
    populateNowPlaying(this, data)
    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {}
  }

  get template() {
    return document.getElementById(nowPlayingTemplate.id).content.cloneNode(true);
  }

  get data() {
    return fetch('/api/now-playing', { type: 'json' }).then((data) => data.json()).catch((e) => {})
  }
}

NowPlaying.register();