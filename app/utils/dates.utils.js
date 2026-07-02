const moment = require('moment');

exports.monthlyStatsDates = async function (dateClosed) {
  let todaysDate = moment(new Date())
  let todayMonthNo = moment(todaysDate).month()
  let thisMonthNo = moment(dateClosed).month()

  let todaysDateISO = moment(new Date()).toISOString()
  let sessionStr = todaysDateISO.substring(0,7)
  let sessionStrToParse = moment(sessionStr.substring(0,7))
  let sessionParsed = Date.parse(sessionStrToParse)

  let sessionLabel = ''
  if (todaysDateISO.substring(5,2) === '01') {
    sessionLabel = moment(todaysDateISO).format('YYYY')
  } else {
    sessionLabel = moment(todaysDateISO).format('MMM')
  }
  let sessionLabelFull = moment(todaysDateISO).format('MMM YYYY')

  let quarter = ""
  let quarterSession = 0
  let previousQuarter = false
  if (thisMonthNo < 3) {
    quarter = "Q1";
    if (thisMonthNo === 0) {
      quarterSession = 1
    } else if (thisMonthNo === 1) {
      quarterSession = 2
    } else if (thisMonthNo === 2) {
      quarterSession = 3
    }
    if (todayMonthNo !== thisMonthNo) {
      if (todayMonthNo === 3 || todayMonthNo === 4 || todayMonthNo === 5) {
        previousQuarter = true
      }
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
    if (todayMonthNo !== thisMonthNo) {
      if (todayMonthNo === 6 || todayMonthNo === 7 || todayMonthNo === 8) {
        previousQuarter = true
      }
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
    if (todayMonthNo !== thisMonthNo) {
      if (todayMonthNo === 1 || todayMonthNo === 2 || todayMonthNo === 3) {
        previousQuarter = true
      }
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
    if (todayMonthNo !== thisMonthNo) {
      if (todayMonthNo === 9 || todayMonthNo === 10 || todayMonthNo === 11) {
        previousQuarter = true
      }
    }
  }

  return {sessionStr, quarter, quarterSession, thisMonthNo, sessionParsed, sessionLabel, sessionLabelFull};
};