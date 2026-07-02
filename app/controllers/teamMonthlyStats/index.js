const moment = require('moment');
const TeamModel = require("../../models/team");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function reloadLeadGenerationsQuarterBreakdown(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Reloading the Lead Generation's quarter breakdown")
    let thisDate = moment(new Date());
    let thisDateToParse = moment(thisDate.toISOString().substring(0,7));
    let month = thisDate.month();
    let quarterBreakdown = {}
    let currentThirdQueried = 0
    let currentSecondQueried = 0
    let currentFirstQueried = 0
    let previousThirdQueried = 0
    let previousSecondQueried = 0
    let previousFirstQueried = 0
    let currentThirdLeads = 0
    let currentSecondLeads = 0
    let currentFirstLeads = 0
    let previousThirdLeads = 0
    let previousSecondLeads = 0
    let previousFirstLeads = 0
    let currentThirdHits = 0
    let currentSecondHits = 0
    let currentFirstHits = 0
    let previousThirdHits = 0
    let previousSecondHits = 0
    let previousFirstHits = 0
    let currentSession = 0;
    if (month < 3) {
      quarterBreakdown.currentQuarter = "Q1";
      quarterBreakdown.previousQuarter = 'Q4';
    } else if (month >= 3 && month < 6) {
      quarterBreakdown.currentQuarter = "Q2";
      quarterBreakdown.previousQuarter = 'Q1';
    } else if (month >= 9) {
      quarterBreakdown.currentQuarter = "Q4";
      quarterBreakdown.previousQuarter = 'Q3';
    } else {
      quarterBreakdown.currentQuarter = "Q3";
      quarterBreakdown.previousQuarter = 'Q2';
    }
    if (month === 2 || month === 5 || month === 8 || month === 11) {
      currentSession = 3;
    } else if (month === 1 || month === 4 || month === 7 || month === 10) {
      currentSession = 2;
    } else {
      currentSession = 1;
    }
    let currentMonth = month;
    let previousMonthOne = null;
    let previousMonthTwo = null;
    let previousMonthThree = null;
    let previousMonthFour = null;
    let previousMonthFive = null;
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

    let team = await TeamModel.findById(req.body.teamId).populate("teamMonthlyStats", 'monthNo quarter quarterSession sessionStr closedRenegotiations sessionLabel sessionLabelFull').select("teamMonthlyStats closedRenegotiations tier1Closures ti2r1Closures tie31Closures tier1Dismissed tier2Dismissed tier3Dismissed dismissedLeads totalClosures")
    let teamLeadGenerationloopNum = 0;
    if (team.teamMonthlyStats.length > 23) {
      teamLeadGenerationloopNum = team.teamMonthlyStats.length
    } else {
      teamLeadGenerationloopNum = 23;
    }
    let teamLeadGenerationArrayIndex = 0;
    for (let i = teamLeadGenerationloopNum; i > -1; i--) {
      let noMonth = true
      if (team.teamMonthlyStats[teamLeadGenerationArrayIndex]) {
        if (((moment(thisDateToParse).subtract(i, 'months')).isAfter(moment(team.teamMonthlyStats[teamLeadGenerationArrayIndex].sessionStr), 'months'))) {
          teamLeadGenerationArrayIndex++
          continue
        }
        if ((moment(thisDateToParse).subtract(i, 'months')).isSame(moment(team.teamMonthlyStats[teamLeadGenerationArrayIndex].sessionStr), 'month')) {
          noMonth = false
          let monthlyStatMonth = team.teamMonthlyStats[teamLeadGenerationArrayIndex].monthNo
          if (teamLeadGenerationArrayIndex < 12) {
            teamLeadGenerationAll.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex])
            teamLeadGenerationTwoYear.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex])
            teamLeadGenerationOneYear.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex])
            if (currentMonth >= 5) {
              if (parseInt(team.teamMonthlyStats[teamLeadGenerationArrayIndex].sessionStr.substr(0,4)) === parseInt(thisDate.toString().substr(11,4))) {
                if (currentMonth === monthlyStatMonth) {
                  quarterBreakdown.currentSessionString = team.teamMonthlyStats[teamLeadGenerationArrayIndex].quarterSession;
                  if (currentSession === 3) {
                    currentThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else if (currentSession === 2) {
                    currentSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else {
                    currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                } else if (previousMonthOne === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else if (currentSession === 2) {
                    currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else {
                    previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                } else if (previousMonthTwo === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else if (currentSession === 2) {
                    previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else {
                    previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                } else if (previousMonthThree === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else if (currentSession === 2) {
                    previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else {
                    previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                } else if (previousMonthFour === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  } else if (currentSession === 2) {
                    previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                } else if (previousMonthFive === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                    previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                    previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                  }
                }
              }
            } else if (monthlyStatMonth <= 4 && parseInt(team.teamMonthlyStats[teamLeadGenerationArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))) || monthlyStatMonth >= 7 && parseInt(team.teamMonthlyStats[teamLeadGenerationArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))-1)) {
              if (currentMonth === monthlyStatMonth) {
                quarterBreakdown.currentSessionString = team.teamMonthlyStats[teamLeadGenerationArrayIndex].quarterSession;
                if (currentSession === 3) {
                  currentThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else if (currentSession === 2) {
                  currentSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else {
                  currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              } else if (previousMonthOne === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else if (currentSession === 2) {
                  currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else {
                  previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              } else if (previousMonthTwo === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  currentFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  currentFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else if (currentSession === 2) {
                  previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else {
                  previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              } else if (previousMonthThree === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousThirdQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousThirdLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousThirdHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else if (currentSession === 2) {
                  previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else {
                  previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              } else if (previousMonthFour === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousSecondQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousSecondLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousSecondHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                } else if (currentSession === 2) {
                  previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              } else if (previousMonthFive === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousFirstQueried = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalQueried
                  previousFirstLeads = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalNewLeads
                  previousFirstHits = team.teamMonthlyStats[teamLeadGenerationArrayIndex].totalHits
                }
              }
            }
          } else if (teamLeadGenerationArrayIndex < 24) {
            teamLeadGenerationAll.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex]);
            teamLeadGenerationTwoYear.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex]);
          } else {
            teamLeadGenerationAll.push(team.teamMonthlyStats[teamLeadGenerationArrayIndex]);
          }
          teamLeadGenerationArrayIndex++
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
        let emptyMonth = {
          sessionLabel: emptyMonthDateLabel,
          sessionLabelFull: sessionLabelFull,
          totalNewLeads: 0,
          totalHits: 0,
          tier1New: 0,
          tier2New: 0,
          tier2Upgraded: 0,
          tier1Updated: 0,
          tier2Updated: 0,
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
    }
    let currentTeamLeadProgress = 0
    let currentTeamHitProgress = 0
    let currentTeamQueriedTotal = Math.round(currentFirstQueried + currentSecondQueried + currentThirdQueried)
    let previousTeamQueriedTotal = Math.round(previousFirstQueried + previousSecondQueried + previousThirdQueried)
    let currentTeamLeadTotal = Math.round(currentFirstLeads + currentSecondLeads + currentThirdLeads)
    let previousTeamLeadTotal = Math.round(previousThirdLeads + previousSecondLeads + previousFirstLeads)
    let currentTeamHitTotal = Math.round(currentFirstHits + currentSecondHits + currentThirdHits)
    let previousTeamHitTotal = Math.round(previousThirdHits + previousSecondHits + previousFirstHits)
    if (previousTeamLeadTotal === 0) {
      currentTeamLeadProgress = 'N/A'
      quarterBreakdown.previousQuarterLeads = 'N/A'
    } else {
      currentTeamLeadProgress = (Math.round(((currentTeamLeadTotal/previousTeamLeadTotal) * 100)*10)/10);
    }
    if (previousTeamHitTotal === 0) {
      currentTeamHitProgress = 'N/A'
      quarterBreakdown.previousQuarterHits = 'N/A'
    } else {
      currentTeamHitProgress = (Math.round(((currentTeamHitTotal/previousTeamHitTotal) * 100)*10)/10);
    }
    quarterBreakdown.currentQueried = currentTeamQueriedTotal
    quarterBreakdown.previousQueried = previousTeamQueriedTotal
    quarterBreakdown.currentHits = currentTeamHitTotal
    quarterBreakdown.previousHits = previousTeamHitTotal
    quarterBreakdown.currentLeads = currentTeamLeadTotal
    quarterBreakdown.previousLeads = previousTeamLeadTotal
    quarterBreakdown.currentTeamLeadProgress = currentTeamLeadProgress
    quarterBreakdown.currentTeamHitProgress = currentTeamHitProgress
        
    sendApiSuccessResponse(res, {quarterBreakdown}, "success")
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Reload Lead Generations Quarter Breakdown', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function reloadRenegotiationsQuarterBreakdown(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Reloading the Renegotiations's quarter breakdown")
    let thisDate = moment(new Date());
    let thisDateToParse = moment(thisDate.toISOString().substring(0,7));
    let month = thisDate.month();
    let quarterBreakdown = {}
    let currentFirstClosures = 0
    let currentSecondClosures = 0
    let currentThirdClosures = 0
    let previousFirstClosures = 0
    let previousSecondClosures = 0
    let previousThirdClosures = 0
    let currentSession = 0;
    if (month < 3) {
      quarterBreakdown.currentQuarter = "Q1";
      quarterBreakdown.previousQuarter = 'Q4';
    } else if (month >= 3 && month < 6) {
      quarterBreakdown.currentQuarter = "Q2";
      quarterBreakdown.previousQuarter = 'Q1';
    } else if (month >= 9) {
      quarterBreakdown.currentQuarter = "Q4";
      quarterBreakdown.previousQuarter = 'Q3';
    } else {
      quarterBreakdown.currentQuarter = "Q3";
      quarterBreakdown.previousQuarter = 'Q2';
    }
    if (month === 2 || month === 5 || month === 8 || month === 11) {
      currentSession = 3;
    } else if (month === 1 || month === 4 || month === 7 || month === 10) {
      currentSession = 2;
    } else {
      currentSession = 1;
    }
    let currentMonth = month;
    let previousMonthOne = null;
    let previousMonthTwo = null;
    let previousMonthThree = null;
    let previousMonthFour = null;
    let previousMonthFive = null;
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
    
    let team = await TeamModel.findById(req.body.teamId).populate("teamMonthlyStats", 'monthNo quarter quarterSession sessionStr closedRenegotiations sessionLabel sessionLabelFull').select("teamMonthlyStats closedRenegotiations tier1Closures tier2Closures tier3Closures tier1Dismissed tier2Dismissed tier3Dismissed dismissedLeads totalClosures manualClosures manualDismissed")
    let teamRenegotiationloopNum = 0
    if (team.teamMonthlyStats.length > 23) {
      teamRenegotiationloopNum = team.teamMonthlyStats.length
    } else {
      teamRenegotiationloopNum = 23
    }
    let statArrayIndex = 0
    for (let i = teamRenegotiationloopNum; i > -1; i--) {
      if (team.teamMonthlyStats[statArrayIndex]) {
        if (((moment(thisDateToParse).subtract(i, 'months')).isAfter(moment(team.teamMonthlyStats[statArrayIndex].sessionStr), 'months'))) {
          statArrayIndex++
          teamRenegotiationloopNum++
          continue
        }
        if ((moment(thisDateToParse).subtract(i, 'months')).isSame(moment(team.teamMonthlyStats[statArrayIndex].sessionStr), 'month')) {
          let monthlyStatMonth = team.teamMonthlyStats[statArrayIndex].monthNo;
          if (statArrayIndex < 12) {
            if (currentMonth >= 5) {
              if (parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === parseInt(thisDate.toString().substr(11,4))) {
                if (currentMonth === monthlyStatMonth) {
                  quarterBreakdown.currentSessionString = team.teamMonthlyStats[statArrayIndex].quarterSession
                  if (currentSession === 3) {
                    currentThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else if (currentSession === 2) {
                    currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else {
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                } else if (previousMonthOne === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else if (currentSession === 2) {
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else {
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                } else if (previousMonthTwo === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else if (currentSession === 2) {
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else {
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                } else if (previousMonthThree === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else if (currentSession === 2) {
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else {
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                } else if (previousMonthFour === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  } else if (currentSession === 2) {
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                } else if (previousMonthFive === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                  }
                }
              }
            } else if (monthlyStatMonth <= 4 && parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))) || monthlyStatMonth >= 7 && parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))-1)) {
              if (currentMonth === monthlyStatMonth) {
                quarterBreakdown.currentSessionString = team.teamMonthlyStats[statArrayIndex].quarterSession;
                if (currentSession === 3) {
                  currentThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else if (currentSession === 2) {
                  currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else {
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              } else if (previousMonthOne === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else if (currentSession === 2) {
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else {
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              } else if (previousMonthTwo === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else if (currentSession === 2) {
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else {
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              } else if (previousMonthThree === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else if (currentSession === 2) {
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else {
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              } else if (previousMonthFour === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                } else if (currentSession === 2) {
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              } else if (previousMonthFive === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRenegotiations
                }
              }
            }
          }
          statArrayIndex++
        }
      }
    }
    let currentTeamRenegotiationProgress = 0
    let currentTeamRenegotiationClosures = currentFirstClosures + currentSecondClosures + currentThirdClosures
    let previousTeamRenegotiationClosures = previousThirdClosures + previousSecondClosures + previousFirstClosures
    if (previousTeamRenegotiationClosures === 0) {
      currentTeamRenegotiationProgress = 'N/A'
      quarterBreakdown.previousQuarter = 'N/A'
    } else {
      currentTeamRenegotiationProgress = (Math.round(((currentTeamRenegotiationClosures/previousTeamRenegotiationClosures) * 100)*10)/10)
    }
    quarterBreakdown.currentRenegotiations = currentTeamRenegotiationClosures
    quarterBreakdown.previousRenegotiations = previousTeamRenegotiationClosures
    quarterBreakdown.currentProgress = currentTeamRenegotiationProgress

    let newPieChartOne = {}
    let newPieChartTwo = {}
    let newPieChartThree = {}

    let leadTier = req.body.leadTier
    let actionTaken = req.body.actionTaken
    let closureType = req.body.closureType
    if (actionTaken === 'closed') {
      newPieChartOne = {name: `Renegotiations: ${team.closedRenegotiations}`, size: parseInt(`${team.closedRenegotiations}`)}
      newPieChartTwo = {name: `Closures: ${team.totalClosures}`, size: parseInt(`${team.totalClosures}`)}
      if (leadTier === 1) {
        let tier1ClosureRatio = (Math.round(((team.tier1Closures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier1ClosureRatio}%`, size: parseInt(`${team.tier1Closures}`)}
      } else if (leadTier === 2) {
        let tier2ClosureRatio = (Math.round(((team.tier2Closures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier2ClosureRatio}%`, size: parseInt(`${team.tier2Closures}`)}
      } else if (leadTier) {
        let tier3ClosureRatio = (Math.round(((team.manualClosures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier3ClosureRatio}%`, size: parseInt(`${team.manualClosures}`)}
      }
    } else if (actionTaken === 'dismissed') {
      newPieChartTwo = {name: `Dismissals: ${team.dismissedLeads}`, size: parseInt(`${team.dismissedLeads}`)}
      if (leadTier === 1) {
        let tier1DismissalRatio = (Math.round(((team.tier1Dismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier1DismissalRatio}%`, size: parseInt(`${team.tier1Dismissed}`)}
      } else if (leadTier === 2) {
        let tier2DismissalRatio = (Math.round(((team.tier2Dismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier2DismissalRatio}%`, size: parseInt(`${team.tier2Dismissed}`)}
      } else if (leadTier) {
        let tier3DismissalRatio = (Math.round(((team.manualDismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier3DismissalRatio}%`, size: parseInt(`${team.manualDismissed}`)}
      }
    }

    sendApiSuccessResponse(res, {quarterBreakdown, newPieChartOne, newPieChartTwo, newPieChartThree, leadTier, actionTaken, closureType}, "success")
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Reload Renegotiations Quarter Breakdown', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function reloadRefinancesQuarterBreakdown(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Reloading the Refinances's quarter breakdown")
    let thisDate = moment(new Date());
    let thisDateToParse = moment(thisDate.toISOString().substring(0,7));
    let month = thisDate.month();
    let quarterBreakdown = {}
    let currentFirstClosures = 0
    let currentSecondClosures = 0
    let currentThirdClosures = 0
    let previousFirstClosures = 0
    let previousSecondClosures = 0
    let previousThirdClosures = 0
    let currentThirdGross = 0
    let currentSecondGross = 0
    let currentFirstGross = 0
    let previousThirdGross = 0
    let previousSecondGross = 0
    let previousFirstGross = 0
    let currentSession = 0
    if (month < 3) {
      quarterBreakdown.currentQuarter = "Q1";
      quarterBreakdown.previousQuarter = 'Q4';
    } else if (month >= 3 && month < 6) {
      quarterBreakdown.currentQuarter = "Q2";
      quarterBreakdown.previousQuarter = 'Q1';
    } else if (month >= 9) {
      quarterBreakdown.currentQuarter = "Q4";
      quarterBreakdown.previousQuarter = 'Q3';
    } else {
      quarterBreakdown.currentQuarter = "Q3";
      quarterBreakdown.previousQuarter = 'Q2';
    }
    if (month === 2 || month === 5 || month === 8 || month === 11) {
      currentSession = 3;
    } else if (month === 1 || month === 4 || month === 7 || month === 10) {
      currentSession = 2;
    } else {
      currentSession = 1;
    }
    let currentMonth = month;
    let previousMonthOne = null;
    let previousMonthTwo = null;
    let previousMonthThree = null;
    let previousMonthFour = null;
    let previousMonthFive = null;
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

    let team = await TeamModel.findById(req.body.teamId).populate("teamMonthlyStats", 'monthNo quarter quarterSession grossProfitNumber grossProfitPercent closedRefinances sessionStr grossProfitNumber grossProfitPercent sessionLabel sessionLabelFull').select("teamMonthlyStats closedRefinances tier1Closures ti2r1Closures tie31Closures tier1Dismissed tier2Dismissed tier3Dismissed totalClosures dismissedLeads manualDismissed manualClosures")
    let teamRefinanceloopNum = 0;
    if (team.teamMonthlyStats.length > 23) {
      teamRefinanceloopNum = team.teamMonthlyStats.length
    } else {
      teamRefinanceloopNum = 23;
    }
    let statArrayIndex = 0;
    for (let i = teamRefinanceloopNum; i > -1; i--) {
      if (team.teamMonthlyStats[statArrayIndex]) {
        if (((moment(thisDateToParse).subtract(i, 'months')).isAfter(moment(team.teamMonthlyStats[statArrayIndex].sessionStr), 'months'))) {
          statArrayIndex++;
          continue
        }
        if ((moment(thisDateToParse).subtract(i, 'months')).isSame(moment(team.teamMonthlyStats[statArrayIndex].sessionStr), 'month')) {
          let monthlyStatMonth = team.teamMonthlyStats[statArrayIndex].monthNo;
          if (statArrayIndex < 12) {
            if (currentMonth >= 5) {
              if (parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === parseInt(thisDate.toString().substr(11,4))) {
                if (currentMonth === monthlyStatMonth) {
                  quarterBreakdown.currentSessionString = team.teamMonthlyStats[statArrayIndex].quarterSession;
                  if (currentSession === 3) {
                    currentThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else if (currentSession === 2) {
                    currentSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else {
                    currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                } else if (previousMonthOne === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else if (currentSession === 2) {
                    currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else {
                    previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                } else if (previousMonthTwo === monthlyStatMonth) {
                  if (currentSession === 3) {
                    currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else if (currentSession === 2) {
                    previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else {
                    previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                } else if (previousMonthThree === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else if (currentSession === 2) {
                    previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else {
                    previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                } else if (previousMonthFour === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  } else if (currentSession === 2) {
                    previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                } else if (previousMonthFive === monthlyStatMonth) {
                  if (currentSession === 3) {
                    previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                    previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                  }
                }
              }
            } else if (monthlyStatMonth <= 4 && parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))) || monthlyStatMonth >= 7 && parseInt(team.teamMonthlyStats[statArrayIndex].sessionStr.substr(0,4)) === (parseInt(thisDate.toString().substr(11,4))-1)) {
              if (currentMonth === monthlyStatMonth) {
                quarterBreakdown.currentSessionString = team.teamMonthlyStats[statArrayIndex].quarterSession;
                if (currentSession === 3) {
                  currentThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else if (currentSession === 2) {
                  currentSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else {
                  currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              } else if (previousMonthOne === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else if (currentSession === 2) {
                  currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else {
                  previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              } else if (previousMonthTwo === monthlyStatMonth) {
                if (currentSession === 3) {
                  currentFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  currentFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else if (currentSession === 2) {
                  previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else {
                  previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              } else if (previousMonthThree === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousThirdGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousThirdClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else if (currentSession === 2) {
                  previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else {
                  previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              } else if (previousMonthFour === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousSecondGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousSecondClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                } else if (currentSession === 2) {
                  previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              } else if (previousMonthFive === monthlyStatMonth) {
                if (currentSession === 3) {
                  previousFirstGross = team.teamMonthlyStats[statArrayIndex].grossProfitNumber
                  previousFirstClosures = team.teamMonthlyStats[statArrayIndex].closedRefinances
                }
              }
            }
          }
          statArrayIndex++
        }
      }
    }
    let currentTeamRefinanceProgress = 0;
    let currentTeamRefinanceGross = Math.round(currentFirstGross + currentSecondGross + currentThirdGross);
    let previousTeamRefinanceGross = Math.round(previousThirdGross + previousSecondGross + previousFirstGross);
    let currentTeamRefinances = Math.round(currentFirstClosures + currentSecondClosures + currentThirdClosures);
    let previousTeamRefinances = Math.round(previousFirstClosures + previousSecondClosures + previousThirdClosures);
    if (previousTeamRefinanceGross === 0) {
      currentTeamRefinanceProgress = 'N/A'
      quarterBreakdown.previousQuarter = 'N/A'
    } else {
      currentTeamRefinanceProgress = (Math.round(((currentTeamRefinanceGross/previousTeamRefinanceGross) * 100)*10)/10);
    }
    if (currentTeamRefinanceGross > 99999 && currentTeamRefinanceGross < 999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000).toFixed(1)) + 'k'
    } else if (currentTeamRefinanceGross > 999999 && currentTeamRefinanceGross < 9999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000000).toFixed(3)) + 'm'
    } else if (currentTeamRefinanceGross > 9999999 && currentTeamRefinanceGross < 999999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000000).toFixed(2)) + 'm'
    } else if (currentTeamRefinanceGross > 999999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000000000).toFixed(3)) + 't'
    }
    if (previousTeamRefinanceGross > 99999 && previousTeamRefinanceGross < 999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000).toFixed(1)) + 'k'
    } else if (previousTeamRefinanceGross > 999999 && previousTeamRefinanceGross < 9999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000000).toFixed(3)) + 'm'
    } else if (previousTeamRefinanceGross > 9999999 && previousTeamRefinanceGross < 999999999) {
      previousTeamRefinanceGross = Math.sign(previouspreviousTeamRefinanceGrossGross)*((Math.abs(previousTeamRefinanceGross)/1000000).toFixed(2)) + 'm'
    } else if (previousTeamRefinanceGross > 999999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000000000).toFixed(3)) + 't'
    }
    quarterBreakdown.currentGross = currentTeamRefinanceGross
    quarterBreakdown.previousGross = previousTeamRefinanceGross
    quarterBreakdown.currentProgress = currentTeamRefinanceProgress
    quarterBreakdown.currentRefinances = currentTeamRefinances
    quarterBreakdown.previousRefinances = previousTeamRefinances

    let newPieChartOne = {}
    let newPieChartTwo = {}
    let newPieChartThree = {}
    let leadTier = req.body.leadTier
    let actionTaken = req.body.actionTaken
    let closureType = req.body.closureType
    if (actionTaken === 'closed') {
      newPieChartOne = {name: `Refinances: ${team.closedRefinances}`, size: parseInt(`${team.closedRefinances}`)}
      newPieChartTwo = {name: `Closures: ${team.totalClosures}`, size: parseInt(`${team.totalClosures}`)}
      if (leadTier === 1) {
        let tier1ClosureRatio = (Math.round(((team.tier1Closures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier1ClosureRatio}%`, size: parseInt(`${team.tier1Closures}`)}
      } else if (leadTier === 2) {
        let tier2ClosureRatio = (Math.round(((team.tier2Closures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier2ClosureRatio}%`, size: parseInt(`${team.tier2Closures}`)}
      } else if (leadTier) {
        let tier3ClosureRatio = (Math.round(((team.manualClosures/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier3ClosureRatio}%`, size: parseInt(`${team.manualClosures}`)}
      }
    } else if (actionTaken === 'dismissed') {
      newPieChartTwo = {name: `Dismissals: ${team.dismissedLeads}`, size: parseInt(`${team.dismissedLeads}`)}
      if (leadTier === 1) {
        let tier1DismissalRatio = (Math.round(((team.tier1Dismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier1DismissalRatio}%`, size: parseInt(`${team.tier1Dismissed}`)}
      } else if (leadTier === 2) {
        let tier2DismissalRatio = (Math.round(((team.tier2Dismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier2DismissalRatio}%`, size: parseInt(`${team.tier2Dismissed}`)}
      } else if (leadTier) {
        let tier3DismissalRatio = (Math.round(((team.manualDismissed/team.totalClosures)*100)*10)/10)
        newPieChartThree = {name: `${tier3DismissalRatio}%`, size: parseInt(`${team.manualDismissed}`)}
      }
    }

    sendApiSuccessResponse(res, {quarterBreakdown, newPieChartOne, newPieChartTwo, newPieChartThree, leadTier, actionTaken, closureType}, "success")
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Reload Refinances Quarter Breakdown', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { reloadLeadGenerationsQuarterBreakdown, reloadRenegotiationsQuarterBreakdown, reloadRefinancesQuarterBreakdown }