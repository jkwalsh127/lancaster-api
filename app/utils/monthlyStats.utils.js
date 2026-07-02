const moment = require('moment')

const establishMonthlyStatSession = async function (thisMonthNo, todaysDate) {

  let nextQueryLabel = ""
  let quarter = ""
  let quarterSession = 0
  if (thisMonthNo < 3) {
    quarter = "Q1";
    if (thisMonthNo === 0) {
      quarterSession = 1
    } else if (thisMonthNo === 1) {
      quarterSession = 2
    } else if (thisMonthNo === 2) {
      quarterSession = 3
    }
  } else if (thisMonthNo >= 3 && thisMonthNo < 6) {
    quarter = "Q2";
    if (thisMonthNo === 3) {
      quarterSession = 1
    } else if (thisMonthNo === 4) {
      quarterSession = 2
    } else if (thisMonthNo === 5) {
      quarterSession = 3
    }
  } else if (thisMonthNo >= 9) {
    quarter = "Q4";
    if (thisMonthNo === 9) {
      quarterSession = 1
    } else if (thisMonthNo === 10) {
      quarterSession = 2
    } else if (thisMonthNo === 11) {
      quarterSession = 3
    }
  } else {
    quarter = "Q3";
    if (thisMonthNo === 6) {
      quarterSession = 1
    } else if (thisMonthNo === 7) {
      quarterSession = 2
    } else if (thisMonthNo === 8) {
      quarterSession = 3
    }
  }
  let todaysDateStr = moment(todaysDate).toISOString()
  let sessionStr = todaysDateStr.substring(0,7)
  let sessionLabel = ''
  if (todaysDateStr.substring(5,2) === '01') {
    sessionLabel = moment(todaysDate).format('YYYY')
  } else {
    sessionLabel = moment(todaysDate).format('MMM')
  }
  nextQueryLabel = todaysDate.add(30, 'days').format("MMM Do")


  return {quarter, quarterSession, sessionLabel, sessionStr, nextQueryLabel}
};

module.exports = { establishMonthlyStatSession }