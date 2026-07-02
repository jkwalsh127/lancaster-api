const moment = require('moment')

const loadTeamRefinanceMonthlyStats = async function (teamMonthlyStats, thisDate, thisDateToParse) {

  let currentFirstRefinanceClosuresTeam = 0;
  let currentSecondRefinanceClosuresTeam = 0;
  let currentThirdRefinanceClosuresTeam = 0;
  let previousFirstRefinanceClosuresTeam = 0;
  let previousSecondRefinanceClosuresTeam = 0;
  let previousThirdRefinanceClosuresTeam = 0;
  let currentThirdGrossTeam = 0;
  let currentSecondGrossTeam = 0;
  let currentFirstGrossTeam = 0;
  let previousThirdGrossTeam = 0;
  let previousSecondGrossTeam = 0;
  let previousFirstGrossTeam = 0;
  let teamRefinanceQuarterBreakdown = {};

  let month = thisDate.month()
  let currentSession = 0
  if (month < 3) {
    teamRefinanceQuarterBreakdown.currentQuarter = "Q1";
    teamRefinanceQuarterBreakdown.previousQuarter = 'Q4';
  } else if (month >= 3 && month < 6) {
    teamRefinanceQuarterBreakdown.currentQuarter = "Q2";
    teamRefinanceQuarterBreakdown.previousQuarter = 'Q1';
  } else if (month >= 9) {
    teamRefinanceQuarterBreakdown.currentQuarter = "Q4";
    teamRefinanceQuarterBreakdown.previousQuarter = 'Q3'
  } else {
    teamRefinanceQuarterBreakdown.currentQuarter = "Q3";
    teamRefinanceQuarterBreakdown.previousQuarter = 'Q2'
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
  let teamRefinanceMonthlyStatsAll = []
  let teamRefinanceMonthlyStatsTwoYear = []
  let teamRefinanceMonthlyStatsOneYear = []
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
        teamRefinanceMonthlyStatsAll.push(teamMonthlyStats[arrayIndex])
        teamRefinanceMonthlyStatsTwoYear.push(teamMonthlyStats[arrayIndex])
        teamRefinanceMonthlyStatsOneYear.push(teamMonthlyStats[arrayIndex])
        if (currentMonth >= 5) {
          if (parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === parseInt(thisDate.toString().substr(11,4))) {
            if (currentMonth === monthlyStatMonth) {
              teamRefinanceQuarterBreakdown.currentSessionString = teamMonthlyStats[arrayIndex].quarterSession;
              if (currentSession === 3) {
                currentThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else if (currentSession === 2) {
                currentSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else {
                currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            } else if (previousMonthOne === monthlyStatMonth) {
              if (currentSession === 3) {
                currentSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else if (currentSession === 2) {
                currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else {
                previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            } else if (previousMonthTwo === monthlyStatMonth) {
              if (currentSession === 3) {
                currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else if (currentSession === 2) {
                previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else {
                previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            } else if (previousMonthThree === monthlyStatMonth) {
              if (currentSession === 3) {
                previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else if (currentSession === 2) {
                previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else {
                previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            } else if (previousMonthFour === monthlyStatMonth) {
              if (currentSession === 3) {
                previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              } else if (currentSession === 2) {
                previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            } else if (previousMonthFive === monthlyStatMonth) {
              if (currentSession === 3) {
                previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
                previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
              }
            }
          }
        } else if (monthlyStatMonth <= 4 && parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))) || monthlyStatMonth >= 7 && parseInt(teamMonthlyStats[arrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))-1)) {
          if (currentMonth === monthlyStatMonth) {
            teamRefinanceQuarterBreakdown.currentSessionString = teamMonthlyStats[arrayIndex].quarterSession;
            if (currentSession === 3) {
              currentThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else if (currentSession === 2) {
              currentSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else {
              currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          } else if (previousMonthOne === monthlyStatMonth) {
            if (currentSession === 3) {
              currentSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else if (currentSession === 2) {
              currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else {
              previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          } else if (previousMonthTwo === monthlyStatMonth) {
            if (currentSession === 3) {
              currentFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              currentFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else if (currentSession === 2) {
              previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else {
              previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          } else if (previousMonthThree === monthlyStatMonth) {
            if (currentSession === 3) {
              previousThirdGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousThirdRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else if (currentSession === 2) {
              previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else {
              previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          } else if (previousMonthFour === monthlyStatMonth) {
            if (currentSession === 3) {
              previousSecondGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousSecondRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            } else if (currentSession === 2) {
              previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          } else if (previousMonthFive === monthlyStatMonth) {
            if (currentSession === 3) {
              previousFirstGrossTeam = teamMonthlyStats[arrayIndex].grossProfitNumber
              previousFirstRefinanceClosuresTeam = teamMonthlyStats[arrayIndex].closedRefinances
            }
          }
        }
      } else if (arrayIndex < 24) {
        teamRefinanceMonthlyStatsAll.push(teamMonthlyStats[arrayIndex]);
        teamRefinanceMonthlyStatsTwoYear.push(teamMonthlyStats[arrayIndex]);
      } else {
        teamRefinanceMonthlyStatsAll.push(teamMonthlyStats[arrayIndex]);
      }
    }
    if (noMonth) {
      let emptyMonthDateLabel = '';
        if (moment(thisDate).subtract(i, 'months').month() === 0) {
          emptyMonthDateLabel = moment(thisDate).subtract(i, 'months').format('YYYY');
        } else {
          emptyMonthDateLabel = moment(thisDate).subtract(i, 'months').format('MMM');
        }
        let sessionLabelFull = moment(thisDateToParse).subtract(i, 'months').format('MMM YYYY');
        let sessionToParse = moment(thisDate).toISOString()
        let sessionStrToParse = moment(sessionToParse.substring(0,7))
        let sessionParsed = Date.parse(sessionStrToParse)
        let emptyMonth = {
          sessionParsed: sessionParsed,
          sessionLabel: emptyMonthDateLabel,
          sessionLabelFull: sessionLabelFull,
          closedRefinances: 0,
          grossProfitNumber: 0,
          grossProfitPercent: 0,
        }
        if (i < 12) {
          teamRefinanceMonthlyStatsAll.push(emptyMonth);
          teamRefinanceMonthlyStatsTwoYear.push(emptyMonth);
          teamRefinanceMonthlyStatsOneYear.push(emptyMonth);
        } else if (i < 24) {
          teamRefinanceMonthlyStatsAll.push(emptyMonth);
          teamRefinanceMonthlyStatsTwoYear.push(emptyMonth);
        } else {
          teamRefinanceMonthlyStatsAll.push(emptyMonth);
        }
    }
    arrayIndex--
    loopNum--
  }
  return {teamRefinanceMonthlyStatsAll, teamRefinanceMonthlyStatsTwoYear, teamRefinanceMonthlyStatsOneYear, previousFirstGrossTeam, previousSecondGrossTeam, previousThirdGrossTeam, currentFirstGrossTeam, currentSecondGrossTeam, currentThirdGrossTeam, previousThirdRefinanceClosuresTeam, previousSecondRefinanceClosuresTeam, previousFirstRefinanceClosuresTeam, currentThirdRefinanceClosuresTeam, currentSecondRefinanceClosuresTeam, currentFirstRefinanceClosuresTeam, teamRefinanceQuarterBreakdown}
}
  
module.exports = { loadTeamRefinanceMonthlyStats }