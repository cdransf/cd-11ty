window.onload = () => {
  const pagination = document.getElementById('pagination')
  const uri = window.location.pathname
  const urlSegments = uri.split('/').filter(segment => segment !== '')
  let pageNumber = parseInt(urlSegments[urlSegments.length - 1]) || 0
  pagination.querySelector(`option[value="${pageNumber.toString()}"]`).setAttribute('selected', 'selected')

  if (pagination) {
    pagination.addEventListener('change', (event) => {
      pageNumber = event.target.value

      if (urlSegments.length === 0 || isNaN(urlSegments[urlSegments.length - 1])) {
        urlSegments.push(pageNumber.toString())
      } else {
        urlSegments[urlSegments.length - 1] = pageNumber.toString()
      }

      if (pageNumber === 0) {
        window.location.href = `${window.location.protocol}//${window.location.host}/`
      } else {
        window.location = `${window.location.protocol}//${window.location.host}/${urlSegments.join('/')}`
      }
    })
  }
}