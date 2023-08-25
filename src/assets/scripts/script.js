;(async function () {
  const nowPlaying = document.getElementById('now-playing')
  if (nowPlaying) {
    const emoji = document.getElementById('now-playing-emoji')
    const content = document.getElementById('now-playing-content')
    const loading = document.getElementById('now-playing-loading')

    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) {
        loading.style.display = 'none'
        emoji.innerText = cache.emoji
        content.innerText = `${cache.title} by ${cache.artist}`
        emoji.classList.remove('hidden')
        content.classList.remove('hidden')
      }
    } catch (e) {
      /* quiet catch */
    }

    const res = await fetch('/api/now-playing', {
      type: 'json',
    }).catch()
    const data = await res.json()

    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {
      /* quiet catch */
    }

    if (!JSON.parse(localStorage.getItem('now-playing')) && !data) nowPlaying.remove()

    loading.style.display = 'none'
    emoji.innerText = data.emoji
    content.innerText = `${data.title} by ${data.artist}`
    emoji.classList.remove('hidden')
    content.classList.remove('hidden')
  }
})()
