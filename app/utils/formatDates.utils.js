const moment = require('moment')

exports.formatDates = async function (date) {
  let formattedDate = ''
  let formattedDateLabel = ''

  if (date.length > 20) {
    formattedDate = date
    formattedDateLabel = moment(date).format("MMM Do, YYYY")
  } else if (date.length === 14 || date.length === 13) {
    // formattedDate = moment(date.toISOString())
    formattedDate = moment(date)
    formattedDateLabel = moment(date).format("MMM Do, YYYY")
  } else {
    formattedDate = moment(date)
    formattedDateLabel = moment(date).format("MMM Do, YYYY")
  }

  return {formattedDate, formattedDateLabel}
}