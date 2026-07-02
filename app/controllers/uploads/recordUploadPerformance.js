const moment = require('moment');
const TeamModel = require('../../models/team');
const UploadReportModel = require('../../models/uploadReport');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats');
const { monthlyStatsDates } = require('../../utils/dates.utils')
const { establishMonthlyStatSession } = require('../../utils/monthlyStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function recordUploadPerformance(req, res) {
  try{
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Recording the Upload Performance")
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let todaysDateLabelShort = todaysDate.format("MM/DD/YY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")

    let dates = monthlyStatsDates(moment(new Date()))
    let thisMonthNo = moment(todaysDate).month()
    let sessionLabelFull = moment(new Date()).format('MMM YYYY')
    let sessionToParse = moment(todaysDate).toISOString()
    let sessionStrToParse = moment(sessionToParse.substring(0,7))
    let monthlyStatSessionParsed = Date.parse(sessionStrToParse)
    let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
    let quarter = monthlyStatSession.quarter
    let sessionStr = monthlyStatSession.sessionStr
    let sessionLabel = monthlyStatSession.sessionLabel
    let quarterSession = monthlyStatSession.quarterSession
    let sessionParsed = Date.parse(moment(sessionToParse.substring(0,7)))

    let teamUpdateObj = {}
    teamUpdateObj.$push = {}
    let newLeadIds = req.body.newLeadIds
    let numberErrors = req.body.numberErrors
    let totalNewLeads = req.body.totalNewLeads
    let numberSuccessess = req.body.numberSuccessess
    let totalDiscrepanciesCount = req.body.totalDiscrepanciesCount
    let numberDuplicates = req.body.numberDuplicates
    let numberNoResults = req.body.numberNoResults
    let uploadTimeParsed = req.body.uploadTimeParsed
    let totalQueried = (numberSuccessess + numberErrors)
    
    let team = await TeamModel.findById(req.body.teamId).select('_id remainingMonthlyQueries totalSuccessfulQueries totalLeadsGenerated totalHits members totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining mortgages')
    let remainingMonthlyQueries = team.remainingMonthlyQueries
    let newTotalSuccessfulQueries = team.totalSuccessfulQueries + numberSuccessess
    let newTotalLeadsGenerated = team.totalLeadsGenerated + totalNewLeads
    let newTotalHits = team.totalHits + totalNewLeads
    let newTotalHitsAvgPercent = (Math.round(((newTotalLeadsGenerated/newTotalSuccessfulQueries)*100)*10000)/10000)
    if (isNaN(newTotalHitsAvgPercent)) {
      newTotalHitsAvgPercent = 0
    }

    //* Handle Upload Report
    let existingUploadReport = false
    let existingUploadReports = await UploadReportModel.find({uploadTimeParsed: uploadTimeParsed})
    for (let i = 0; i < existingUploadReports.length; i++) {
      if (existingUploadReports[i].uploadType === req.body.uploadType) {
        if (req.body.lastIsNoResults) {
          if (req.body.monthlyQueriesExhausted) {
            await existingUploadReports[i].updateOne({
              monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
              $push: {noResultsObjs: {$each: [ req.body.noResultsObjs[0] ]}}, 
              $inc: { numberNoResults: 1},
            })
          } else {
            await existingUploadReports[i].updateOne({
              $push: {noResultsObjs: {$each: [ req.body.noResultsObjs[0] ]}}, 
              $inc: { numberNoResults: 1},
            })
          }
        } else if (req.body.lastIsError) {
          if (req.body.monthlyQueriesExhausted) {
            await existingUploadReports[i].updateOne({
              monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
              $push: {errorObjs: {$each: [ req.body.errorObjs[0] ]}},
              $inc: { numberErrors: 1}
            })
          } else {
            await existingUploadReports[i].updateOne({
              $push: {errorObjs: {$each: [ req.body.errorObjs[0] ]}},
              $inc: { numberErrors: 1}
            })
          }
        } else if (req.body.lastIsDuplicate) {
          if (req.body.monthlyQueriesExhausted) {
            await existingUploadReports[i].updateOne({
              monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
              $push: {duplicateObjs: {$each: [ req.body.duplicateObjs[0] ]}},
              $inc: { numberDuplicates: 1}
            })
          } else {
            await existingUploadReports[i].updateOne({
              $push: {duplicateObjs: {$each: [ req.body.duplicateObjs[0] ]}},
              $inc: { numberDuplicates: 1}
            })
          }
        } else if (req.body.lastIsNewLead) {
          if (req.body.monthlyQueriesExhausted) {
            await existingUploadReports[i].updateOne({
              monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
              $push: {newLeadObjs: {$each: [ req.body.leadObjs[0] ]}},
              $inc: { numberNewLeads: 1, numberSuccessess: 1}
            })
          } else {
            await existingUploadReports[i].updateOne({
              $push: {newLeadObjs: {$each: [ req.body.leadObjs[0] ]}},
              $inc: { numberNewLeads: 1, numberSuccessess: 1}
            })
          }
        } else {
          if (req.body.monthlyQueriesExhausted) {
            await existingUploadReports[i].updateOne({
              monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
              $inc: { numberSuccessess: 1},
            })
          
        } else {
            await existingUploadReports[i].updateOne({
              $inc: { numberSuccessess: 1},
            })
          } 
          }
        newUploadReport = await UploadReportModel.findById(existingUploadReports[i]._id)
        existingUploadReport = true
        break
      }
    }
    if (!existingUploadReport) {
      let reportObj = {
        date: todaysDateLabelShort,
        uploadTimeParsed: uploadTimeParsed,
        uploadType: req.body.uploadType,
        numberSuccessess: numberSuccessess,
        numberErrors: numberErrors,
        numberNoResults: numberNoResults,
        numberDuplicates: numberDuplicates,
        numberNewLeads: totalNewLeads,
        duplicateObjs: req.body.duplicateObjs,
        noResultsObjs: req.body.noResultsObjs,
        errorObjs: req.body.errorObjs,
        newLeadObjs: req.body.leadObjs,
        contributor: req.body.userFullName,
        monthlyQueriesExhausted: req.body.monthlyQueriesExhausted,
      }
      newUploadReport = new UploadReportModel(reportObj)
      await newUploadReport.save()
      teamUpdateObj.$push.uploadReports = {
        $each: [ newUploadReport._id ],
        $position: 0,
      }
    }

    //* Record Monthly Stat
    let newMonthlyStat = null
    let createNewMonthlyStat = true
    if (req.body.recordNewMonthlyStats) {
      let oldMonthlyStat = await TeamMonthlyStatsModel.findOne({sessionParsed: monthlyStatSessionParsed}).select("sessionLabel totalQueried successfulQueries grossProfitNumber totalNewLeads updatedLeads totalHits previousTier1 previousTier2 tier1Updated tier2Updated tier2Upgraded tier1New tier2New totalDiscrepancies sessionParsed updatedTier1Count updatedTier2Count upgradedTier2Count totalNewTier1Leads totalNewTier2Leads completeNotFound completeMissingRecords propMixMissingRecords attomMissingRecords clCurrentMortgageMissingRecords propMixNotFound attomNotFound clCurrentMortgageNotFound failedQueries")
      if (oldMonthlyStat) {
        if (oldMonthlyStat.sessionParsed === monthlyStatSessionParsed) {
          createNewMonthlyStat = false
          let totalHitsPercent = 0
          if (totalQueried > 0 && oldMonthlyStat.totalQueried > 0) {
            totalHitsPercent = (Math.round((((oldMonthlyStat.totalNewLeads + totalNewLeads)/(oldMonthlyStat.totalQueried + totalQueried))*100)*10000)/10000)
          }
          updateObj = {
            totalQueried: oldMonthlyStat.totalQueried + totalQueried,
            successfulQueries: oldMonthlyStat.successfulQueries + numberSuccessess,
            failedQueries: oldMonthlyStat.failedQueries + numberErrors,
            totalNewLeads: oldMonthlyStat.totalNewLeads + totalNewLeads,
            totalHits: oldMonthlyStat.totalHits + totalNewLeads,
            totalHitsPercent: totalHitsPercent,
            tier1New: oldMonthlyStat.tier1New + totalNewLeads,
            totalDiscrepancies: oldMonthlyStat.totalDiscrepancies + totalDiscrepanciesCount,
          }
          newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((oldMonthlyStat._id), updateObj, { new: true })
        }
      }
      if (createNewMonthlyStat) {
        let totalHitsPercent = 0
        if (totalQueried !== 0) {
          totalHitsPercent = (Math.round(((totalNewLeads/totalQueried)*100)*10000)/10000)
        }
        let monthlyStat = new TeamMonthlyStatsModel({
          belongsToTeam: team._id,
          sessionParsed: monthlyStatSessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: thisMonthNo,
          quarter: quarter,
          quarterSession: quarterSession,
          totalQueried: totalQueried,
          successfulQueries: numberSuccessess,
          failedQueries: numberErrors,
          totalNewLeads: totalNewLeads,
          totalHits: totalNewLeads,
          totalHitsPercent: totalHitsPercent,
          tier1New: totalNewLeads,
          totalDiscrepancies: totalDiscrepanciesCount,
          closedRefinances: 0,
          closedRenegotiations: 0,
          grossProfitNumber: 0,
          grossProfitPercent: 0,
          teamGrossProfitNumber: 0,
          teamGrossProfitPercent: 0,
          leadsDismissed: 0,
        })
        await monthlyStat.save()
        newMonthlyStat = await TeamMonthlyStatsModel.findById(monthlyStat._id)
      }
    }

    //* Update Team Stats
    remainingMonthlyQueries = remainingMonthlyQueries - totalQueried
    teamUpdateObj.remainingMonthlyQueries = remainingMonthlyQueries
    teamUpdateObj.totalSuccessfulQueries = newTotalSuccessfulQueries
    teamUpdateObj.totalLeadsGenerated = newTotalLeadsGenerated
    teamUpdateObj.totalHits = newTotalHits
    teamUpdateObj.totalHitsAvgPercent = newTotalHitsAvgPercent
    if (createNewMonthlyStat) {
      teamUpdateObj.$push = {
        teamMonthlyStats: {
          $each: [ newMonthlyStat._id ],
          $position: 0,
        }
      }
    }
    teamUpdateObj.$inc = {
      totalOriginalLoanAmount: 0,
      totalOriginalInterest: 0,
      totalPrincipalRemaining: 0,
      totalInterestRemaining: 0,
      totalAssessedPropertyValue: 0,
    }
    if (req.body.originalLoanAmountDifference) {
      teamUpdateObj.$inc.originalLoanAmountDifference = req.body.originalLoanAmountDifference
    }
    if (req.body.originalInterestDifference) {
      teamUpdateObj.$inc.originalInterestDifference = req.body.originalInterestDifference
    }
    if (req.body.principalRemainingDifference) {
      teamUpdateObj.$inc.principalRemainingDifference = req.body.principalRemainingDifference
    }
    if (req.body.interestRemainingDifference) {
      teamUpdateObj.$inc.interestRemainingDifference = req.body.interestRemainingDifference
    }
    if (req.body.assessmentValueDifference) {
      teamUpdateObj.$inc.totalAssessedPropertyValue = req.body.assessmentValueDifference
    }
    await team.updateOne(teamUpdateObj)

    let userUploadNotification = null
    if (req.body.notifyAssignees) {
      userUploadNotification = await notifyAssignees(team.members, req.body.userId, null, null, null, "upload", null, totalNewLeads, totalQueried, newLeadIds, uploadTimeParsed, req.body.userFullName, req.body.leadObjs)
    }

    let newLog = await handleRequestLog('Log', logTime, 'Record Upload Performance', '', [{type: 'Settings', detail: `Upload Type: ${req.body.uploadType}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newUploadReport, newMonthlyStat, userUploadNotification, newTotalLeadsGenerated, newTotalSuccessfulQueries, newTotalHits, newTotalHitsAvgPercent, totalNewLeads, remainingMonthlyQueries}, 'upload successful!');    
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Record Upload Performance', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { recordUploadPerformance }