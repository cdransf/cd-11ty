let ignore = window?.localStorage?.getItem('ignore')
let urlBase = 'https://coryd.dev/api/event/'
let params = `site=${encodeURIComponent(window.location.origin)}&page=${encodeURIComponent(window.location.pathname)}&lang=${encodeURIComponent(navigator.language)}&nav=${encodeURIComponent(navigator.userAgent)}`
let url = `${urlBase}?${params}`;
if (ignore) url = `${urlBase}?ignore=${ignore}&${params}`
if (!window.fathom) fetch(url).then(() => {}).catch(() => {});