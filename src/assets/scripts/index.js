const id = Math.floor(Math.random() * Date.now())
let i;
let url = `https://coryd.dev/api/event/?page=${encodeURIComponent(window.location.href)}&num=${sessionStorage.getItem('id' || id)}&lang=${encodeURIComponent(navigator.language)}&nav=${encodeURIComponent(navigator.userAgent)}`
if (window.sessionStorage && !window.sessionStorage?.getItem('id')) sessionStorage.setItem('id', id)
if (window.localStorage && window.localStorage.getItem('i')) {
  i = localStorage.getItem('i')
  url = `${url}&i=${i}`
}
if (!window.fathom) fetch(url).then((data) => {}).catch(err => {});