export default {
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