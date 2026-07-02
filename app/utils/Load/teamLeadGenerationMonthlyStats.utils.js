const moment = require('moment')

const loadTeamLeadGenerationMonthlyStats = async function (teamMonthlyStats, thisDate, thisDateToParse) {
  let loopNum = 0
  let teamLeadGenerationAll = []
  let teamLeadGenerationTwoYear = []
  let teamLeadGenerationOneYear = []
  if (teamMonthlyStats.length > 23) {
    loopNum = teamMonthlyStats.length
  } else {
    loopNum = 23
  }
  let arrayIndex = loopNum
  for (let i = loopNum; i > -1; i--) {
    let noMonth = true
    if (teamMonthlyStats[arrayIndex]) {
      noMonth = false
      if (arrayIndex < 12) {
        teamLeadGenerationAll.push(teamMonthlyStats[arrayIndex])
        teamLeadGenerationTwoYear.push(teamMonthlyStats[arrayIndex])
        teamLeadGenerationOneYear.push(teamMonthlyStats[arrayIndex])
      } else if (arrayIndex < 24) {
        teamLeadGenerationAll.push(teamMonthlyStats[arrayIndex]);
        teamLeadGenerationTwoYear.push(teamMonthlyStats[arrayIndex]);
      } else {
        teamLeadGenerationAll.push(teamMonthlyStats[arrayIndex]);
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
        successfulQueries: 0,
        totalNewLeads: 0,
        totalHits: 0,
        tier1New: 0,
        tier2New: 0,
        tier2Upgraded: 0,
        tier1Updated: 0,
        tier2Updated: 0,
        recordsVerified: 0,
      }
      if (i < 12) {
        teamLeadGenerationAll.push(emptyMonth);
        teamLeadGenerationTwoYear.push(emptyMonth);
        teamLeadGenerationOneYear.push(emptyMonth);
      } else if (i < 24) {
        teamLeadGenerationAll.push(emptyMonth);
        teamLeadGenerationTwoYear.push(emptyMonth);
      } else {
        teamLeadGenerationAll.push(emptyMonth);
      }
    }
    arrayIndex--
    loopNum--
  }
  return {teamLeadGenerationAll, teamLeadGenerationTwoYear, teamLeadGenerationOneYear}
}
  
module.exports = { loadTeamLeadGenerationMonthlyStats }