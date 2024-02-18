if (window.location.hostname !== 'localhost') {
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
      } catch (e) {
        /* quiet catch */
      }

      const data = await fetch('/api/now-playing', {
        type: 'json',
      })
        .then((data) => data.json())
        .catch(() => {
          loading.style.display = 'none'
        })

      try {
        localStorage.setItem('now-playing', JSON.stringify(data))
      } catch (e) {
        /* quiet catch */
      }

      if (!JSON.parse(localStorage.getItem('now-playing')) && !data) nowPlaying.remove()

      populateNowPlaying(data)
    }
  })()
}

;(async function() {
  const btn = document.querySelector('.theme__toggle');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('theme__light');
    document.body.classList.toggle('theme__dark');

    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage?.getItem('theme');
    let theme;

    if (!currentTheme) localStorage?.setItem('theme', (prefersDarkScheme ? 'dark' : 'light'))

    if (prefersDarkScheme) {
      theme = document.body.classList.contains('theme__light') ? 'light' : 'dark';
    } else {
      theme = document.body.classList.contains('theme__dark') ? 'dark' : 'light';
    }
    localStorage?.setItem('theme', theme);
  });
})()