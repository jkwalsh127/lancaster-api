const moment = require('moment');
const TeamModel = require('../../models/team');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats');
const { monthlyStatsDates } = require('../../utils/dates.utils')
const QueryPerformanceStatsModel = require('../../models/queryPerformanceStats');
const { establishMonthlyStatSession } = require('../../utils/monthlyStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');
const { loadTeamPortfolioMonthlyStats } = require('../../utils/Load/teamPortfolioMonthlyStats');

async function recordSweepPerformance(req, res) {
  try{
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Recording the Query Performance")
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let dates = monthlyStatsDates(moment(new Date()))
    let querySettings = req.body.querySettings
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let sessionToParse = moment(todaysDate).toISOString()
    let sessionStrToParse = moment(sessionToParse.substring(0,7))
    let sessionParsed = Date.parse(sessionStrToParse)
    let lastQueryLabel = todaysDate.format("MMM Do")
    let thisMonthNo = moment(todaysDate).month()
    let sessionLabelFull = moment(todaysDate).format('MMM YYYY')
    let dateParsed = Date.parse(todaysDate)
    let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
    let nextQueryLabel = monthlyStatSession.nextQueryLabel
    let quarter = monthlyStatSession.quarter
    let sessionStr = monthlyStatSession.sessionStr
    let sessionLabel = monthlyStatSession.sessionLabel
    let quarterSession = monthlyStatSession.quarterSession

    let team = await TeamModel.findById(req.body.teamId).populate('sweepParameters').select('sweepParameters teamMonthlyStats members totalSuccessfulQueries totalHits totalLeadsGenerated totalTier1Leads totalTier2Leads leadsAwaitingUpdate leadsAwaitingVerification queryPerformances subscriptionMonthlyQueries totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining')

    let remainingMonthlyQueries = team.subscriptionMonthlyQueries-(req.body.sweepResults.totalQueried)
    let previousTotalSuccessfulQueries = team.totalSuccessfulQueries
    let previousTotalLeadsGenerated = team.totalLeadsGenerated
    let newTeamLeadsAwaitingUpdate = team.leadsAwaitingUpdate + req.body.sweepResults.newLeadsAwaitingUpdate
    let newTeamLeadsAwaitingVerification = team.leadsAwaitingVerification + req.body.sweepResults.newLeadsAwaitingVerification
    let previousTotalHits = team.totalHits
    let previousTier1 = team.totalTier1Leads
    let previousTier2 = team.totalTier2Leads
    let newTeam = {}
    let monthlyStat = {}
    let newTeamStats = {}
    let newMonthlyStat = null
    let newQueryPerformance = {}
    let createNewMonthlyStat = true

    //* Record Monthly Stat
    if (querySettings.recordNewMonthlyStats === 'true') {
      let oldMonthlyStat = await TeamMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("sessionLabel totalQueried successfulQueries grossProfitNumber totalNewLeads updatedLeads totalHits previousTier1 previousTier2 tier1Updated tier2Updated tier2Upgraded tier1New tier2New totalDiscrepancies sessionParsed updatedTier1Count updatedTier2Count upgradedTier2Count totalNewTier1Leads totalNewTier2Leads completeNotFound completeMissingRecords propMixMissingRecords attomMissingRecords clCurrentMortgageMissingRecords propMixNotFound attomNotFound clCurrentMortgageNotFound failedQueries")
      if (oldMonthlyStat) {
        if (oldMonthlyStat.sessionParsed === sessionParsed) {
          createNewMonthlyStat = false
          let totalHitsPercent = 0
          if (req.body.sweepResults.totalQueried > 0 && oldMonthlyStat.totalQueried > 0) {
            totalHitsPercent = (Math.round((((oldMonthlyStat.totalNewLeads + req.body.sweepResults.totalNewLeads)/(oldMonthlyStat.totalQueried + req.body.sweepResults.totalQueried))*100)*10000)/10000)
          }
          updateObj = {
            totalQueried: oldMonthlyStat.totalQueried + req.body.sweepResults.totalQueried,
            successfulQueries: oldMonthlyStat.successfulQueries + req.body.sweepResults.totalSuccessfulQueries,
            failedQueries: oldMonthlyStat.failedQueries + req.body.sweepResults.totalFailedQueries,
            totalNewLeads: oldMonthlyStat.totalNewLeads + req.body.sweepResults.totalNewLeads,
            updatedLeads: oldMonthlyStat.updatedLeads + req.body.sweepResults.totalUpdated,
            totalHits: oldMonthlyStat.totalHits + req.body.sweepResults.totalNewLeads + req.body.sweepResults.totalUpdated + req.body.sweepResults.leadsWithUpgradedTiers,
            totalHitsPercent: totalHitsPercent,
            previousTier1: oldMonthlyStat.previousTier1 + previousTier1,
            previousTier2: oldMonthlyStat.previousTier2 + previousTier2,
            tier1Updated: oldMonthlyStat.tier1Updated + req.body.sweepResults.updatedTier1Count,
            tier2Updated: oldMonthlyStat.tier2Updated + req.body.sweepResults.updatedTier2Count,
            tier2Upgraded: oldMonthlyStat.tier2Upgraded + req.body.sweepResults.upgradedTier2Count,
            tier1New: oldMonthlyStat.tier1New + req.body.sweepResults.totalNewTier1Leads,
            tier2New: oldMonthlyStat.tier2New + req.body.sweepResults.totalNewTier2Leads,
            totalDiscrepancies: oldMonthlyStat.totalDiscrepancies + req.body.sweepResults.totalDiscrepancies,
            attomNotFound: oldMonthlyStat.attomNotFound + req.body.sweepResults.attomNotFound.length,
            propMixNotFound: oldMonthlyStat.propMixNotFound + req.body.sweepResults.propMixNotFound.length,
            clCurrentMortgageNotFound: oldMonthlyStat.clCurrentMortgageNotFound + req.body.sweepResults.clCurrentMortgageNotFound.length,
            completeNotFound: oldMonthlyStat.completeNotFound + req.body.sweepResults.completeNotFound.length,
            attomMissingRecords: oldMonthlyStat.attomMissingRecords + req.body.sweepResults.attomMissingRecords.length,
            propMixMissingRecords: oldMonthlyStat.propMixMissingRecords + req.body.sweepResults.propMixMissingRecords.length,
            clCurrentMortgageMissingRecords: oldMonthlyStat.clCurrentMortgageMissingRecords + req.body.sweepResults.clCurrentMortgageMissingRecords.length,
            completeMissingRecords: oldMonthlyStat.completeMissingRecords + req.body.sweepResults.completeMissingRecords.length,
          }
          newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((oldMonthlyStat._id), updateObj, { new: true })
        }
      }
      if (createNewMonthlyStat) {
        let totalHitsPercent = 0
        if (req.body.sweepResults.totalQueried !== 0) {
          totalHitsPercent = (Math.round(((req.body.sweepResults.totalNewLeads/req.body.sweepResults.totalQueried)*100)*10000)/10000)
        }
        monthlyStat = new TeamMonthlyStatsModel({
          belongsToTeam: team._id,
          sessionParsed: sessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: thisMonthNo,
          quarter: quarter,
          quarterSession: quarterSession,
          totalQueried: req.body.sweepResults.totalQueried,
          successfulQueries: req.body.sweepResults.totalSuccessfulQueries,
          failedQueries: req.body.sweepResults.totalFailedQueries,
          attomSuccessfulQueries: req.body.sweepResults.attomSuccessfulQueries,
          clCurrentMortgageSuccessfulQueries: req.body.sweepResults.clCurrentMortgageSuccessfulQueries,
          propMixSuccessfulQueries: req.body.sweepResults.propMixSuccessfulQueries,
          totalNewLeads: req.body.sweepResults.totalNewLeads,
          totalUpdatedLeads: req.body.sweepResults.totalUpdated,
          totalHits: req.body.sweepResults.totalNewLeads + req.body.sweepResults.totalUpdated + req.body.sweepResults.leadsWithUpgradedTiers,
          totalHitsPercent: totalHitsPercent,
          previousTier1: previousTier1,
          previousTier2: previousTier2,
          tier1Updated: req.body.sweepResults.updatedTier1Count,
          tier2Updated: req.body.sweepResults.updatedTier2Count,
          tier2Upgraded: req.body.sweepResults.upgradedTier2Count,
          tier1New: req.body.sweepResults.totalNewTier1Leads,
          tier2New: req.body.sweepResults.totalNewTier2Leads,
          totalDiscrepancies: req.body.sweepResults.totalDiscrepancies,
          closedRefinances: 0,
          closedRenegotiations: 0,
          grossProfitNumber: 0,
          grossProfitPercent: 0,
          teamGrossProfitNumber: 0,
          teamGrossProfitPercent: 0,
          leadsDismissed: 0,
          attomNotFound: req.body.sweepResults.attomNotFound.length,
          propMixNotFound: req.body.sweepResults.propMixNotFound.length,
          clCurrentMortgageNotFound: req.body.sweepResults.clCurrentMortgageNotFound.length,
          completeNotFound: req.body.sweepResults.completeNotFound.length,
          attomMissingRecords: req.body.sweepResults.attomMissingRecords.length,
          propMixMissingRecords: req.body.sweepResults.propMixMissingRecords.length,
          completeMissingRecords: req.body.sweepResults.completeMissingRecords.length,
          clCurrentMortgageMissingRecords: req.body.sweepResults.clCurrentMortgageMissingRecords.length,
        })
        await monthlyStat.save()
        newMonthlyStat = await TeamMonthlyStatsModel.findById(monthlyStat._id)
      }
    }

    //* Record Query performance
    if (querySettings.recordPerformance === 'true') {
      let queryPerformanceObj = {
        date: todaysDateLabel,
        totalQueried: req.body.sweepResults.totalQueried,
        totalSuccessfulQueries: req.body.sweepResults.totalSuccessfulQueries,
        propMixSuccessfulQueries: req.body.sweepResults.propMixSuccessfulQueries,
        attomSuccessfulQueries: req.body.sweepResults.attomSuccessfulQueries,
        clCurrentMortgageSuccessfulQueries: req.body.sweepResults.clCurrentMortgageSuccessfulQueries,
        totalFailedQueries: req.body.sweepResults.totalFailedQueries,
        totalInactive: req.body.sweepResults.totalInactiveLeads,
        totalDiscrepancies: req.body.sweepResults.totalDiscrepancies,
        totalNewLeads: req.body.sweepResults.totalNewLeads,
        tier1New: req.body.sweepResults.totalNewTier1Leads,
        tier2New: req.body.sweepResults.totalNewTier2Leads,
        tier1Updated: req.body.sweepResults.updatedTier1Count,
        tier2Updated: req.body.sweepResults.updatedTier2Count,
        tier2Upgraded: req.body.sweepResults.upgradedTier2Count,
        totalTier1Discrepancies: req.body.sweepResults.totalTier1Discrepancies,
        totalTier2Discrepancies: req.body.sweepResults.totalTier2Discrepancies,
        totalTier3Discrepancies: req.body.sweepResults.totalTier3Discrepancies,
        totalUpdatedLeads: req.body.sweepResults.totalUpdated,
        leadsWithUpgradedTiers: req.body.sweepResults.leadsWithUpgradedTiers,
        attomNotFound: req.body.sweepResults.attomNotFound,
        propMixNotFound: req.body.sweepResults.propMixNotFound,
        clCurrentMortgageNotFound: req.body.sweepResults.clCurrentMortgageNotFound,
        completeNotFound: req.body.sweepResults.completeNotFound,
        attomMissingRecords: req.body.sweepResults.attomMissingRecords,
        propMixMissingRecords: req.body.sweepResults.propMixMissingRecords,
        clCurrentMortgageMissingRecords: req.body.sweepResults.clCurrentMortgageMissingRecords,
        completeMissingRecords: req.body.sweepResults.completeMissingRecords,
        formattingErrors: req.body.sweepResults.formattingErrors,
        improperQueries: req.body.sweepResults.improperQueries,
        brokenConnections: req.body.sweepResults.brokenConnections,
        monthlyQueriesExhausted: req.body.sweepResults.monthlyQueriesExhausted,
      }
      if (req.body.sweepSizeSelection === 'All') {
        queryPerformanceObj.selection = 'all'
        for (let i = 0; i < team.queryPerformances.length; i++) {
          let oldPerformance = await QueryPerformanceStatsModel.findById(team.queryPerformances[i]).select('selection propMixSuccessfulQueries attomSuccessfulQueries clCurrentMortgageSuccessfulQueries')
          if (oldPerformance.selection === 'all') {
            if (oldPerformance.propMixSuccessfulQueries < req.body.sweepResults.propMixSuccessfulQueries) {
              queryPerformanceObj.propMixGreaterThanLast = true
            } else if (oldPerformance.propMixSuccessfulQueries > req.body.sweepResults.propMixSuccessfulQueries) {
              queryPerformanceObj.propMixLessThanLast = true
            }
            if (oldPerformance.attomSuccessfulQueries < req.body.sweepResults.attomSuccessfulQueries) {
              queryPerformanceObj.attomGreaterThanLast = true
            } else if (oldPerformance.attomSuccessfulQueries > req.body.sweepResults.attomSuccessfulQueries) {
              queryPerformanceObj.attomLessThanLast = true
            }
            if (oldPerformance.clCurrentMortgageSuccessfulQueries > req.body.sweepResults.clCurrentMortgageSuccessfulQueries) {
              queryPerformanceObj.clCurrentMortgageGreaterThanLast = true
            } else if (oldPerformance.clCurrentMortgageSuccessfulQueries < req.body.sweepResults.clCurrentMortgageSuccessfulQueries) {
              queryPerformanceObj.clCurrentMortgageLessThanLast = true
            }
            break
          }
        }
      } else {
        queryPerformanceObj.selection = 'limited'
      }
      let queryPerformance = new QueryPerformanceStatsModel(queryPerformanceObj)
      await queryPerformance.save()
      newQueryPerformance = await QueryPerformanceStatsModel.findById(queryPerformance._id)
    }

    //* Notify Team
    let userNotification = null
    if (querySettings.notifyAssignees === 'true') {
      userNotification = await notifyAssignees(team.members, req.body.userId, null, null, null, "query", null, req.body.sweepResults.totalNewLeads, req.body.sweepResults.totalSuccessfulQueries, req.body.sweepResults.newLeadIds, null, null, req.body.sweepResults.newLeadObjs)
    }

    //* Record Team Stats
    let newLeadCount = req.body.sweepResults.newLeadIds.length
    if (querySettings.updateTeamStats === 'true') {
      let newTotalSuccessfulQueries = req.body.sweepResults.totalSuccessfulQueries + previousTotalSuccessfulQueries
      let newTotalLeadsGenerated = previousTotalLeadsGenerated + req.body.sweepResults.totalNewLeads
      let newTotalHits = previousTotalHits + req.body.sweepResults.totalNewLeads + req.body.sweepResults.totalUpdated
      let newTotalHitsAvgPercent = (Math.round(((newTotalLeadsGenerated/newTotalSuccessfulQueries)*100)*10000)/10000)
      if (isNaN(newTotalHitsAvgPercent)) {
        newTotalHitsAvgPercent = 0
      }
      let teamStatsObj = {}
      if (createNewMonthlyStat) {
        teamStatsObj = {
          leadsAwaitingUpdate: newTeamLeadsAwaitingUpdate,
          leadsAwaitingVerification: newTeamLeadsAwaitingVerification,
          lastQueryParsed: dateParsed,
          totalSuccessfulQueries: newTotalSuccessfulQueries,
          totalLeadsGenerated: newTotalLeadsGenerated,
          totalHits: newTotalHits,
          totalHitsAvgPercent: newTotalHitsAvgPercent,
          totalTier1Leads: req.body.sweepResults.newTier1Count,
          totalTier2Leads: req.body.sweepResults.newTier2Count,
          remainingMonthlyQueries: remainingMonthlyQueries,
          $push: {
            teamMonthlyStats: {
              $each: [ newMonthlyStat._id ],
              $position: 0
            },
            queryPerformances: {
              $each: [ newQueryPerformance._id ],
              $position: 0
            },
          },
          $inc: { 
            completedScans: 1,
          },
        }
      } else {
        teamStatsObj = {
          leadsAwaitingUpdate: newTeamLeadsAwaitingUpdate,
          leadsAwaitingVerification: newTeamLeadsAwaitingVerification,
          lastQueryParsed: dateParsed,
          totalSuccessfulQueries: newTotalSuccessfulQueries,
          totalLeadsGenerated: newTotalLeadsGenerated,
          totalHits: newTotalHits,
          totalHitsAvgPercent: newTotalHitsAvgPercent,
          totalTier1Leads: previousTier1 + req.body.sweepResults.newTier1Count,
          totalTier2Leads: previousTier2 + req.body.sweepResults.newTier2Count,
          remainingMonthlyQueries: remainingMonthlyQueries,
          $push: {
            queryPerformances: {
              $each: [ newQueryPerformance._id ],
              $position: 0
            },
          },
          $inc: { 
            completedScans: 1,            
          },
        }
      }
      if (req.body.sweepResults.newTeamLeadsAwaitingAction.length > 0) {
        teamStatsObj.$push.leadsAwaitingAction = {$each: req.body.sweepResults.newTeamLeadsAwaitingAction}
      }
      if (querySettings.updateLastQuery === 'true') {
        teamStatsObj.lastQuery = lastQueryLabel
        teamStatsObj.nextQuery = nextQueryLabel
        teamStatsObj.nextQuery = nextQueryLabel
      }
      teamStatsObj.$inc = {
        totalOriginalLoanAmount: req.body.originalLoanAmountDifference,
        totalOriginalInterest: req.body.originalInterestDifference,
        totalPrincipalRemaining: req.body.principalRemainingDifference,
        totalInterestRemaining: req.body.interestRemainingDifference,
        totalAssessedPropertyValue: req.body.assessmentValueDifference,
      }
      newTeam = await TeamModel.findByIdAndUpdate((team._id), teamStatsObj, {new: true})
      newTeamStats = {
        totalSuccessfulQueries: newTotalSuccessfulQueries,
        totalLeadsGenerated: newTotalLeadsGenerated,
        totalHits: newTotalHits,
        totalHitsAvgPercent: newTotalHitsAvgPercent,
        totalTier1Leads: previousTier1 + req.body.sweepResults.newTier1Count,
        totalTier2Leads: previousTier2 + req.body.sweepResults.newTier2Count,
        tier1Closures: newTeam.tier1Closures,
        tier1Dismissed: newTeam.tier1Dismissed,
        tier2Closures: newTeam.tier2Closures,
        tier2Dismissed: newTeam.tier2Dismissed,
        tier3Closures: newTeam.tier3Closures,
        tier3Dismissed: newTeam.tier3Dismissed,
      }
    } else if (querySettings.recordPerformance === 'true') {
      let updateObj = {
        leadsAwaitingUpdate: newTeamLeadsAwaitingUpdate,
        leadsAwaitingVerification: newTeamLeadsAwaitingVerification,
        $push: {
          queryPerformances: {
            $each: [ newQueryPerformance._id ],
            $position: 0
          },
        },
        $inc: { completedScans: 1 },
      }
      if (req.body.sweepResults.newTeamLeadsAwaitingAction.length > 0) {
        updateObj.$push.leadsAwaitingAction = {$each: req.body.sweepResults.newTeamLeadsAwaitingAction}
      }
      newTeam = await TeamModel.findByIdAndUpdate((team._id), updateObj, {new: true})
    }

    let updatedSweepParameters = team.sweepParameters

    let newLog = await handleRequestLog('Log', logTime, 'Query Completed', 'Trans Pac', [{type: 'Settings', detail: `Sweep Type: ${querySettings.sweepType}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newLeadCount, newTeam, newMonthlyStat, lastQueryLabel, nextQueryLabel, newQueryPerformance, newTeamStats, querySettings, updatedSweepParameters, newTeamLeadsAwaitingUpdate, newTeamLeadsAwaitingVerification, userNotification, remainingMonthlyQueries}, 'query successful!');    
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Run Property Search', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { recordSweepPerformance }