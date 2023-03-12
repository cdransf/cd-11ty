const { DateTime } = require('luxon')

module.exports = {
    dateForFeed: (date) => {
        return new Date(date).toISOString()
    },
    toDateTime: (date) => {
        const formatted = DateTime.fromISO(date)

        const trail = (number) => {
            return parseInt(number, 10) < 10 ? `0${number}` : number
        }

        return `${formatted.year}-${trail(formatted.month)}-${trail(formatted.day)} ${trail(
            formatted.hour
        )}:${trail(formatted.minute)}`
    },
    toDateTimeFromUnix: (date) => {
        const formatted = DateTime.fromSeconds(parseInt(date, 10))

        const trail = (number) => {
            return parseInt(number, 10) < 10 ? `0${number}` : number
        }

        return `${trail(formatted.month)}.${trail(formatted.day)}.${formatted.year} ${trail(
            formatted.hour
        )}:${trail(formatted.minute)}`
    },
    isoDateOnly: (date) => {
        let d = new Date(date)
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        return [year, month, day].join('-')
    },
}
