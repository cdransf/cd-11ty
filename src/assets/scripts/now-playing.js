;(async function() {
  const nowPlaying = document.getElementById('now-playing')

  if (nowPlaying) {
    const content = document.getElementById('now-playing-content')
    const loading = document.getElementById('now-playing-loading')
    const populateNowPlaying = (data) => {
      loading.style.display = 'none'
      content.innerHTML = data.content
      content.classList.remove('hidden')
    }
    try {
      const cache = JSON.parse(localStorage.getItem('now-playing'))
      if (cache) populateNowPlaying(cache)
    } catch (e) {}

    const data = await fetch('/api/now-playing', {
      type: 'json',
    })
      .then((data) => data.json())
      .catch(() => {
        loading.style.display = 'none'
      })

    try {
      localStorage.setItem('now-playing', JSON.stringify(data))
    } catch (e) {}

    if (!JSON.parse(localStorage?.getItem('now-playing')) && !data) nowPlaying.remove()

    populateNowPlaying(data)
  }
})()