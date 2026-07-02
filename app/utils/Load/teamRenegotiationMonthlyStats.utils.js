const moment = require('moment')

const loadTeamRenegotiationMonthlyStats = async function (teamMonthlyStats, thisDate, thisDateToParse) {

  let currentFirstRenegotiationClosuresTeam = 0;
  let currentSecondRenegotiationClosuresTeam = 0;
  let currentThirdRenegotiationClosuresTeam = 0;
  let previousFirstRenegotiationClosuresTeam = 0;
  let previousSecondRenegotiationClosuresTeam = 0;
  let previousThirdRenegotiationClosuresTeam = 0;
  let teamRenegotiationQuarterBreakdown = {};

  let month = thisDate.month()
  let currentSession = 0
  if (month < 3) {
    teamRenegotiationQuarterBreakdown.currentQuarter = "Q1";
    teamRenegotiationQuarterBreakdown.previousQuarter = 'Q4';
  } else if (month >= 3 && month < 6) {
    teamRenegotiationQuarterBreakdown.currentQuarter = "Q2";
    teamRenegotiationQuarterBreakdown.previousQuarter = 'Q1';
  } else if (month >= 9) {
    teamRenegotiationQuarterBreakdown.currentQuarter = "Q4";
    teamRenegotiationQuarterBreakdown.previousQuarter = 'Q3'
  } else {
    teamRenegotiationQuarterBreakdown.currentQuarter = "Q3";
    teamRenegotiationQuarterBreakdown.previousQuarter = 'Q2'
  }
  if (month === 2 || month === 5 || month === 8 || month === 11) {
    currentSession = 3
  } else if (month === 1 || month === 4 || month === 7 || month === 10) {
    currentSession = 2
  } else {
    currentSession = 1
  }
  let currentMonth = month
  let previousMonthOne = null
  let previousMonthTwo = null
  let previousMonthThree = null
  let previousMonthFour = null
  let previousMonthFive = null
  if (month > 2) {
    if (currentSession === 3) {
      previousMonthOne = month - 1;
      previousMonthTwo = month - 2;
      previousMonthThree = month - 3;
      previousMonthFour = month - 4;
      previousMonthFive = month - 5;
    } else if (currentSession === 2) {
      previousMonthOne = month - 1;
      previousMonthTwo = month - 2;
      previousMonthThree = month - 3;
      previousMonthFour = month - 4;
    } else if (currentSession === 1) {
      previousMonthOne = month - 1;
      previousMonthTwo = month - 2;
      previousMonthThree = month - 3;
    }
  } else if (month === 2) {
    previousMonthOne = 1;
    previousMonthTwo = 0;
    previousMonthThree = 11;
    previousMonthFour = 10;
    previousMonthFive = 9;
  } else if (month === 1) {
    previousMonthOne = 0;
    previousMonthTwo = 11;
    previousMonthThree = 10;
    previousMonthFour = 9;
  } else if (month === 0) {
    previousMonthOne = 11;
    previousMonthTwo = 10;
    previousMonthThree = 9;
  }

  let loopNum = 0
  let teamRenegotiationMonthlyStatsAll = []
  let teamRenegotiationMonthlyStatsTwoYear = []
  let teamRenegotiationMonthlyStatsOneYear = []
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
      let monthlyStatMonth = teamMonthlyStats[arrayIndex].monthNo;
      if (arrayIndex < 12) {
        teamRenegotiationMonthlyStatsAll.push(teamMonthlyStats[arrayIndex])
        teamRenegotiationMonthlyStatsTwoYear.push(teamMonthlyStats[arrayIndex])
        teamRenegotiationMonthlyStatsOneYear.push(teamMonthlyStats[arrayIndex])
        if (currentMonth >= 5) {
          if (parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === parseInt(thisDate.toString().substr(11,4))) {
            if (currentMonth === monthlyStatMonth) {
              teamRenegotiationQuarterBreakdown.currentSessionString = teamMonthlyStats[arrayIndex].quarterSession;
              if (currentSession === 3) {
                currentThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else if (currentSession === 2) {
                currentSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else {
                currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            } else if (previousMonthOne === monthlyStatMonth) {
              if (currentSession === 3) {
                currentSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else if (currentSession === 2) {
                currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else {
                previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            } else if (previousMonthTwo === monthlyStatMonth) {
              if (currentSession === 3) {
                currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else if (currentSession === 2) {
                previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else {
                previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            } else if (previousMonthThree === monthlyStatMonth) {
              if (currentSession === 3) {
                previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else if (currentSession === 2) {
                previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else {
                previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            } else if (previousMonthFour === monthlyStatMonth) {
              if (currentSession === 3) {
                previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              } else if (currentSession === 2) {
                previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            } else if (previousMonthFive === monthlyStatMonth) {
              if (currentSession === 3) {
                previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
              }
            }
          }
        } else if (monthlyStatMonth <= 4 && parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))) || monthlyStatMonth >= 7 && parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))-1)) {
          if (currentMonth === monthlyStatMonth) {
            teamRenegotiationQuarterBreakdown.currentSessionString = teamMonthlyStats[arrayIndex].quarterSession;
            if (currentSession === 3) {
              currentThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else if (currentSession === 2) {
              currentSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else {
              currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          } else if (previousMonthOne === monthlyStatMonth) {
            if (currentSession === 3) {
              currentSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else if (currentSession === 2) {
              currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else {
              previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          } else if (previousMonthTwo === monthlyStatMonth) {
            if (currentSession === 3) {
              currentFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else if (currentSession === 2) {
              previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else {
              previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          } else if (previousMonthThree === monthlyStatMonth) {
            if (currentSession === 3) {
              previousThirdRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else if (currentSession === 2) {
              previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else {
              previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          } else if (previousMonthFour === monthlyStatMonth) {
            if (currentSession === 3) {
              previousSecondRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            } else if (currentSession === 2) {
              previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          } else if (previousMonthFive === monthlyStatMonth) {
            if (currentSession === 3) {
              previousFirstRenegotiationClosuresTeam = teamMonthlyStats[arrayIndex].closedRenegotiations
            }
          }
        }
      } else if (arrayIndex < 24) {
        teamRenegotiationMonthlyStatsAll.push(teamMonthlyStats[arrayIndex]);
        teamRenegotiationMonthlyStatsTwoYear.push(teamMonthlyStats[arrayIndex]);
      } else {
        teamRenegotiationMonthlyStatsAll.push(teamMonthlyStats[arrayIndex]);
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
      let sessionToParse = moment(thisDate).toISOString()
      let sessionStrToParse = moment(sessionToParse.substring(0,7))
      let sessionParsed = Date.parse(sessionStrToParse)
      let emptyMonth = {
        sessionParsed: sessionParsed,
        sessionLabel: emptyMonthDateLabel,
        sessionLabelFull: sessionLabelFull,
        closedRenegotiations: 0,
      }
      if (i < 12) {
        teamRenegotiationMonthlyStatsAll.push(emptyMonth);
        teamRenegotiationMonthlyStatsTwoYear.push(emptyMonth);
        teamRenegotiationMonthlyStatsOneYear.push(emptyMonth);
      } else if (i < 24) {
        teamRenegotiationMonthlyStatsAll.push(emptyMonth);
        teamRenegotiationMonthlyStatsTwoYear.push(emptyMonth);
      } else {
        teamRenegotiationMonthlyStatsAll.push(emptyMonth);
      }
    }
    arrayIndex--
    loopNum--
  }
  return {teamRenegotiationMonthlyStatsAll, teamRenegotiationMonthlyStatsTwoYear, teamRenegotiationMonthlyStatsOneYear, currentFirstRenegotiationClosuresTeam, previousSecondRenegotiationClosuresTeam, previousFirstRenegotiationClosuresTeam, currentThirdRenegotiationClosuresTeam, currentSecondRenegotiationClosuresTeam, previousThirdRenegotiationClosuresTeam, teamRenegotiationQuarterBreakdown}
}
  
module.exports = { loadTeamRenegotiationMonthlyStats }