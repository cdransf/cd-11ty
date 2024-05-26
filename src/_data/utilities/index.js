import slugify from 'slugify'

export const sanitizeMediaString = (str) => {
  if (!str) return null
  const sanitizedString = str.normalize('NFD').replace(/[\u0300-\u036f\u2010—\.\?\(\)\[\]\{\}]/g, '').replace(/\.{3}/g, '')

  return slugify(sanitizedString, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  })
}

export const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export const getCountryName = (countryCode) => regionNames.of(countryCode.trim()) || countryCode.trim()

export const parseCountryField = (countryField) => {
  if (!countryField) return null

  const delimiters = [',', '/', '&', 'and']
  let countries = [countryField]

  delimiters.forEach(delimiter => {
    countries = countries.flatMap(country => country.split(delimiter))
  })

  return countries.map(getCountryName).join(', ')
}