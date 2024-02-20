const nowPlayingTemplate = document.createElement('template')

nowPlayingTemplate.innerHTML = `
  <p class="now-playing client-side">
    <span class="icon--spin" data-key="loading">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-loader-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a9 9 0 1 0 9 9" /></svg>
    </span>
    <span>
      <span data-key="content"></span>
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
    const data = { ...(await this.data), ...this.linkData };

    this.querySelectorAll("[data-key]").forEach(async (slot) => {
      const { key } = slot.dataset;
      const value = data[key];

      if (key === 'loading') {
        slot.style.display = 'none'
      } else if (key === 'content') {
        slot.innerHTML = value;
      }
    })
  }

  get template() {
    return document
      .getElementById(nowPlayingTemplate.id)
      .content.cloneNode(true);
  }

  get data() {
    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) populateNowPlaying(cache)
    } catch (e) {}
    const data = fetch('/api/now-playing', {
      type: 'json',
    })
      .then((data) => data.json())
      .catch(() => {
        loading.style.display = 'none'
      })
    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {}
    return data;
  }
}

NowPlaying.register();