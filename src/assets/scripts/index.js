let ig;
let url = `https://coryd.dev/api/event/?page=${encodeURIComponent(window.location.href)}&lang=${encodeURIComponent(navigator.language)}&nav=${encodeURIComponent(navigator.userAgent)}`
if (window.localStorage && window.localStorage.getItem('ig')) {
  ig = localStorage.getItem('ig')
  url = `${url}&ig=${ig}`
}
if (!window.fathom) fetch(url).then(() => {}).catch(() => {});