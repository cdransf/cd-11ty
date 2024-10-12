import { DateTime } from 'luxon'

export default {
  isoDateOnly: (date, separator) => {
    let d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join(separator)
  },
  oldPost: (date) => {
    return DateTime.now().diff(DateTime.fromJSDate(new Date(date)), 'years').years > 3
  },
  stringToRFC822Date: (dateString) => {
    const date = new Date(Date.parse(dateString))
    const dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = dayStrings[date.getDay()]
    const dayNumber = String(date.getDate()).padStart(2, '0')
    const month = monthStrings[date.getMonth()]
    const year = date.getFullYear()
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
    const timezone = date.getTimezoneOffset() === 0 ? 'GMT' : 'PT'
    return `${day}, ${dayNumber} ${month} ${year} ${time} ${timezone}`
  },
  stringToRFC3339: (dateString) => {
    const timestamp = Date.parse(dateString);
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp)
      return date.toISOString()
    } else {
      return '';
    }
  }
}