let ignore;
let url = `https://coryd.dev/api/event/?site=${encodeURIComponent(window.location.origin)}&page=${encodeURIComponent(window.location.pathname)}&lang=${encodeURIComponent(navigator.language)}&nav=${encodeURIComponent(navigator.userAgent)}`
if (window.localStorage && window.localStorage.getItem('ignore')) {
  ignore = localStorage.getItem('ignore')
  url = `${url}&ignore=${ignore}`
}
if (!window.fathom) fetch(url).then(() => {}).catch(() => {});