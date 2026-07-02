const moment = require('moment')

const loadTeamPortfolioMonthlyStats = async function (teamPortfolioMonthlyStats, thisDate, thisDateToParse) {
  let loopNum = teamPortfolioMonthlyStats.length - 1
  let teamPortfolioMonthlyStatsAll = []
  let teamPortfolioMonthlyStatsTwoYear = []
  let teamPortfolioMonthlyStatsOneYear = []
  let arrayIndex = loopNum
  for (let i = loopNum; i > -1; i--) {
    let noMonth = true
    if (teamPortfolioMonthlyStats[arrayIndex]) {
      noMonth = false
      if (arrayIndex < 12) {
        teamPortfolioMonthlyStatsAll.push(teamPortfolioMonthlyStats[arrayIndex])
        teamPortfolioMonthlyStatsTwoYear.push(teamPortfolioMonthlyStats[arrayIndex])
        teamPortfolioMonthlyStatsOneYear.push(teamPortfolioMonthlyStats[arrayIndex])
      } else if (arrayIndex < 24) {
        teamPortfolioMonthlyStatsAll.push(teamPortfolioMonthlyStats[arrayIndex]);
        teamPortfolioMonthlyStatsTwoYear.push(teamPortfolioMonthlyStats[arrayIndex]);
      } else {
        teamPortfolioMonthlyStatsAll.push(teamPortfolioMonthlyStats[arrayIndex]);
      }
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
        numberOfMortgages: 0,
        totalOriginalLoanAmount: 0,
        totalOriginalInterest: 0,
        totalMarketPropertyValue: 0,
        totalAssessedPropertyValue: 0,
        totalPrincipalRemaining: 0,
        totalInterestRemaining: 0,
      }
      if (i < 12) {
        teamPortfolioMonthlyStatsAll.push(emptyMonth);
        teamPortfolioMonthlyStatsTwoYear.push(emptyMonth);
        teamPortfolioMonthlyStatsOneYear.push(emptyMonth);
      } else if (i < 24) {
        teamPortfolioMonthlyStatsAll.push(emptyMonth);
        teamPortfolioMonthlyStatsTwoYear.push(emptyMonth);
      } else {
        teamPortfolioMonthlyStatsAll.push(emptyMonth);
      }
    }
    arrayIndex--
    loopNum--
  }
  return {teamPortfolioMonthlyStatsAll, teamPortfolioMonthlyStatsTwoYear, teamPortfolioMonthlyStatsOneYear}
}
  
module.exports = { loadTeamPortfolioMonthlyStats }