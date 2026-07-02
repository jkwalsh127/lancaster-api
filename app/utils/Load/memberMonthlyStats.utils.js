const moment = require('moment')

const loadMemberMonthlyStats = async function (memberMonthlyStats, thisDate, thisDateToParse) {
  let loopNum = 0
  let memberMonthlyStatsArray = []
  if (memberMonthlyStats.length > 23) {
    loopNum = memberMonthlyStats.length
  } else {
    loopNum = 23
  }
  let arrayIndex = loopNum
  for (let i = loopNum; i > -1; i--) {
    let noMonth = true
    if (memberMonthlyStats[arrayIndex]) {
      noMonth = false
      memberMonthlyStatsArray.push(memberMonthlyStats[arrayIndex])
    }
    if (noMonth) {
      let emptyMonthDateLabel = '';
      if (moment(thisDate).subtract(loopNum, 'months').month() === 0) {
        emptyMonthDateLabel = moment(thisDate).subtract(loopNum, 'months').format('YYYY');
      } else {
        emptyMonthDateLabel = moment(thisDate).subtract(loopNum, 'months').format('MMM');
      }
      let sessionLabelFull = moment(thisDateToParse).subtract(loopNum, 'months').format('MMM YYYY');
      let emptyMonth = {
        sessionLabel: emptyMonthDateLabel,
        sessionLabelFull: sessionLabelFull,
        leadsDismissed: 0,
        totalClosures: 0,
        closedRenegotiations: 0,
        closedRefinances: 0,
        grossProfitNumber: 0,
        grossProfitPercent: 0,
      }
      memberMonthlyStatsArray.push(emptyMonth)
    }
    arrayIndex--
    loopNum--
  }
  return memberMonthlyStatsArray
}
  
module.exports = { loadMemberMonthlyStats }