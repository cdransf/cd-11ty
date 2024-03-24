const id = Math.floor(Math.random() * Date.now())
let i;
if (window.sessionStorage && !window.sessionStorage?.getItem('id')) sessionStorage.setItem('id', id)
if (window.localStorage && window.localStorage.getItem('i')) i = localStorage.getItem('i')
if (!window.fathom) {
  fetch(`https://coryd.dev/api/event/?page=${encodeURIComponent(window.location.href)}&num=${sessionStorage.getItem('id' || id)}&lang=${navigator.language}&nav=${navigator.userAgent}&i=${i}`)
    .then((data) => {
      console.log(data)
      return {}
    })
    .catch(err => {
      console.log(err);
      return {}
    });
}