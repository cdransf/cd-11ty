class LiteYTEmbed extends HTMLElement {
  connectedCallback() {
    this.videoId = this.getAttribute('videoid')
    let e = this.querySelector('.lty-playbtn')
    if (
      ((this.playLabel = (e && e.textContent.trim()) || this.getAttribute('playlabel') || 'Play'),
      this.style.backgroundImage ||
        (this.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg")`),
      e ||
        ((e = document.createElement('button')),
        (e.type = 'button'),
        e.classList.add('lty-playbtn'),
        this.append(e)),
      !e.textContent)
    ) {
      const t = document.createElement('span')
      ;(t.className = 'lyt-visually-hidden'), (t.textContent = this.playLabel), e.append(t)
    }
    e.removeAttribute('href'),
      this.addEventListener('pointerover', LiteYTEmbed.warmConnections, { once: !0 }),
      this.addEventListener('click', this.addIframe),
      (this.needsYTApiForAutoplay =
        navigator.vendor.includes('Apple') || navigator.userAgent.includes('Mobi'))
  }
  static addPrefetch(e, t, i) {
    const a = document.createElement('link')
    ;(a.rel = e), (a.href = t), i && (a.as = i), document.head.append(a)
  }
  static warmConnections() {
    LiteYTEmbed.preconnected ||
      (LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com'),
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com'),
      LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net'),
      LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net'),
      (LiteYTEmbed.preconnected = !0))
  }
  fetchYTPlayerApi() {
    window.YT ||
      (window.YT && window.YT.Player) ||
      (this.ytApiPromise = new Promise((e, t) => {
        var i = document.createElement('script')
        ;(i.src = 'https://www.youtube.com/iframe_api'),
          (i.async = !0),
          (i.onload = (t) => {
            YT.ready(e)
          }),
          (i.onerror = t),
          this.append(i)
      }))
  }
  async addYTPlayerIframe(e) {
    this.fetchYTPlayerApi(), await this.ytApiPromise
    const t = document.createElement('div')
    this.append(t)
    const i = Object.fromEntries(e.entries())
    new YT.Player(t, {
      width: '100%',
      videoId: this.videoId,
      playerVars: i,
      events: {
        onReady: (e) => {
          e.target.playVideo()
        },
      },
    })
  }
  async addIframe() {
    if (this.classList.contains('lyt-activated')) return
    this.classList.add('lyt-activated')
    const e = new URLSearchParams(this.getAttribute('params') || [])
    if ((e.append('autoplay', '1'), e.append('playsinline', '1'), this.needsYTApiForAutoplay))
      return this.addYTPlayerIframe(e)
    const t = document.createElement('iframe')
    ;(t.width = 560),
      (t.height = 315),
      (t.title = this.playLabel),
      (t.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'),
      (t.allowFullscreen = !0),
      (t.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        this.videoId
      )}?${e.toString()}`),
      this.append(t),
      t.focus()
  }
}
customElements.define('lite-youtube', LiteYTEmbed)
