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
    const addLeadingZero = (num) => {
      num = num.toString()
      while (num.length < 2) num = '0' + num
      return num
    }
    const dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const timeStamp = Date.parse(dateString)
    const date = new Date(timeStamp)
    const day = dayStrings[date.getDay()]
    const dayNumber = addLeadingZero(date.getDate())
    const month = monthStrings[date.getMonth()]
    const year = date.getFullYear()
    const time = `${addLeadingZero(date.getHours())}:${addLeadingZero(date.getMinutes())}:00`
    const timezone = date.getTimezoneOffset() === 0 ? 'GMT' : 'PT'

    return `${day}, ${dayNumber} ${month} ${year} ${time} ${timezone}`
  }
}