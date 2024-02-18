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