const moment = require('moment')

const updateTimeframe = async function (originationDate, mortgageTerm, todaysDate) {
  let originationDateLabel = ''
  if (originationDate.length !== 13 && originationDate.length !== 14) {
    originationDateLabel = moment(originationDate).format("MMM Do, YYYY")
  } else {
    originationDateLabel = originationDate
  }
  let endDateParsed = moment(originationDateLabel, "MMM Do, YYYY")
  let endDateInt = moment(endDateParsed).add(mortgageTerm, 'years').subtract(1, 'month')
  let endDate = moment(endDateInt).toISOString()
  let endDateLabel = moment(endDateInt).format("MMM Do, YYYY")
  let diffMonths = (endDateInt.diff(todaysDate, 'months')) + 1
  let roundedYears = Math.floor(diffMonths/12)
  let leftoverMonths = diffMonths - (roundedYears * 12)
  let remainingTerm = ''
  let monthsLabel = ''
  if (leftoverMonths === 1) {
    monthsLabel = 'month'
  } else {
    monthsLabel = 'months'
  }
  let yearsLabel = ''
  if (roundedYears === 1) {
    yearsLabel = 'year'
  } else if (roundedYears > 1) {
    yearsLabel = 'years'
  }
  if (roundedYears !== 0) {
    remainingTerm = `${roundedYears} ${yearsLabel} and ${leftoverMonths} ${monthsLabel}`
  } else {
    remainingTerm = `${leftoverMonths} ${monthsLabel}`
  }

  let returnObj = {
    originationDateLabel: originationDateLabel,
    endDate: endDate,
    endDateLabel: endDateLabel,
    diffMonths: diffMonths,
    remainingTerm: remainingTerm,
  }

  return returnObj
}

module.exports = { updateTimeframe }