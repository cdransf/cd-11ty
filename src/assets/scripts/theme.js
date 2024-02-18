;(function() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = localStorage?.getItem('theme');
  let theme;

  if (!currentTheme) localStorage?.setItem('theme', (prefersDarkScheme ? 'dark' : 'light'))

  if (currentTheme === 'dark') {
    document.body.classList.add('theme__dark');
  } else if (currentTheme === 'light') {
    document.body.classList.add('theme__light');
  } else if (prefersDarkScheme) {
    document.body.classList.add('theme__dark');
  } else if (!prefersDarkScheme) {
    document.body.classList.add('theme__light');
  }

  if (prefersDarkScheme) {
    theme = document.body.classList.contains('theme__light') ? 'light' : 'dark';
  } else {
    theme = document.body.classList.contains('theme__dark') ? 'dark' : 'light';
  }
  localStorage?.setItem('theme', theme);
})()