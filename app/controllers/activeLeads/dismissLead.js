const moment = require('moment');
const TeamModel = require('../../models/team');
const UserModel = require("../../models/user");
const { nanoid } = require('nanoid');
const ReportModel = require('../../models/report');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const SweepParameterModel = require('../../models/sweepParameter');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats');
const { establishMonthlyStatSession } = require('../../utils/monthlyStats.utils');
const { recordAssigneeDismissalStats } = require('../../utils/recordAssigneeDismissalStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function dismissLead(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info('*** Dissmissing the lead')
    console.info(`leadId: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let newTimelineGuid = nanoid()
    let leadId = req.body.leadId
    let teamId = req.body.teamId
    let newLog = []
    let currentTeam = await TeamModel.findById(teamId).select('teamMonthlyStats totalTier1Leads tier1Dismissed tier2Dismissed totalTier2Leads totalManualLeads manualDismissed dismissedLeads totalClosures dismissedLeads subscription')
    let activeLead = await ActiveLeadModel.findById(leadId).populate('belongsToMortgage', 'streetAddress StateOrProvince originationDateLabel endDateLabel originalLoanAmount originalInterestRate monthlyPayments endDate StreetAdress StateOrProvince City Owner1FullName Owner2FullName recordDetails postalCode owner1 owner2 originalInterestDue').select("assigneeIds belongsToMortgage targetOutcome assigneeNames tier discrepancies timeline status dateInvestigating tier updates");
    let oldMortgage = await MortgageModel.findById(activeLead.belongsToMortgage._id).select('principalPaid interestPaid principalRemaining interestRemaining assigneeIds')
    let leadStatus = activeLead.status
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let todaysDateStr = moment(todaysDate).toISOString()
    let sessionStr = todaysDateStr.substring(0,7)
    let sessionStrToParse = moment(sessionStr.substring(0,7))
    let sessionParsed = Date.parse(sessionStrToParse)

    let totalDue = activeLead.principalRemaining + activeLead.interestRemaining
    let newTotalDue = (Math.round(totalDue*10000)/10000)
    if (!newTotalDue) {
      newTotalDue = null
    }

    let originalEndDate = moment(activeLead.belongsToMortgage.endDate)
    let monthsRemaining = originalEndDate.diff(todaysDate, 'months')
    let yearsRemaining = (Math.round((originalEndDate.diff(todaysDate, 'years', true))*10)/10)

    //* Provide new timeline entry
    let newTimeline = activeLead.timeline
    let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'Investigation Dismissed', notify: false}
    newTimeline.push(timelineAddition)

    //* Create Report, unless Lead is in the "Awaiting Action" status
    let leadType = ''
    if (leadStatus === 'Awaiting Action') {
      leadType = 'leadsAwaitingAction'
    } else if (leadStatus === 'Investigating') {
      leadType = 'investigatingLeads'
    } else if (leadStatus === 'Closing') {
      leadType = 'Closing'
    } else {
      leadType = 'awaitingUpdateLeads'
    }
    let newReport = new ReportModel({
      status: 'new',
      type: 'dismissed',
      streetAddress: activeLead.belongsToMortgage.streetAddress,
      City: activeLead.belongsToMortgage.city,
      PostalCode: activeLead.belongsToMortgage.postalCode,
      StateOrProvince: activeLead.belongsToMortgage.StateOrProvince,
      outcome: activeLead.targetOutcome,
      dateGenerated: todaysDateLabel,
      Owner1FullName: activeLead.belongsToMortgage.owner1,
      Owner2FullName: activeLead.belongsToMortgage.owner2,
      originalOriginationDate: activeLead.belongsToMortgage.originationDateLabel,
      originalEndDate: activeLead.belongsToMortgage.endDateLabel,
      originalLoanAmount: activeLead.belongsToMortgage.originalLoanAmount,
      originalInterestRate: activeLead.belongsToMortgage.originalInterestRate,
      originalInterestDue: activeLead.belongsToMortgage.originalInterestDue,
      originalMonthlyPayments: activeLead.belongsToMortgage.monthlyPayments,
      tier: activeLead.tier,
      discrepancies: activeLead.discrepancies,
      assignees: activeLead.assigneeNames,
      remainingMonthsAtDismissal: monthsRemaining,
      remainingYearsAtDismissal: yearsRemaining,
      principalPaidAtDismissal: oldMortgage.principalPaid,
      interestPaidAtDismissal: oldMortgage.interestPaid,
      principalRemainingAtDismissal: oldMortgage.principalRemaining,
      interestRemainingAtDismissal: oldMortgage.interestRemaining,
      timeline: newTimeline,
      newTotalDue: newTotalDue,
    });
    await newReport.save()
    newReport.notifyUser = true

    //* send notifications to assignees. First filter out those that are both mortgage and lead assignees
    // let mortgageAssigneeIds = oldMortgage.assigneeIds
    let leadAssigneeIds = activeLead.assigneeIds
    // for (let i = 0; i < mortgageAssigneeIds.length; i++) {
    //   let newAssigneeIds = leadAssigneeIds.filter(assignee => assignee.toString() !== mortgageAssigneeIds[i].toString())
    //   leadAssigneeIds = newAssigneeIds
    // }
    await notifyAssignees(leadAssigneeIds, req.body.userId, oldMortgage._id, activeLead._id, null, "leadDismissed", "inactive")
    // await notifyAssignees(mortgageAssigneeIds, req.body.userId, oldMortgage._id, activeLead._id, null, "mortgageDismissed", "inactive")
    
    //* record dismissal stats for each assignee
    let assigneeIds = leadAssigneeIds
    // let assigneeIds = [...leadAssigneeIds, ...mortgageAssigneeIds]
    let assigneeUpdateObjs = []
    let returnMemberMonthlyStats = []
    if (currentTeam.subscription[0] === 'enterprise') {
      updateAssigneeStats = await recordAssigneeDismissalStats(assigneeIds, leadId, leadStatus, newReport._id, sessionParsed, activeLead.discrepancies)
      assigneeUpdateObjs = updateAssigneeStats.assigneeUpdateObjs
      returnMemberMonthlyStats = updateAssigneeStats.returnMemberMonthlyStats
    } else {
      let leadPullCategory = ''
      if (leadStatus === 'investigating') {
        leadPullCategory = 'investigatingLeads'
      } else if (leadStatus === 'closing') {
        leadPullCategory = 'closingLeads'
      } else if (leadStatus === 'awaitingAction') {
        leadPullCategory = 'awaitingActionLeads'
      } else {
        leadPullCategory = 'awaitingUpdateLeads'
      }
      for (let i = 0; i < assigneeIds.length; i++) {
        await UserModel.findByIdAndUpdate((assigneeIds[i]), {
          $pull: { [leadPullCategory]: leadId },
          $push: { newReports: { $each: [ newReport._id ] } },
        })
      }
    }

    //* update stats on Team and MonthlyStat
    let leadTier = activeLead.tier
    let totalTier1Leads = currentTeam.totalTier1Leads
    let totalTier2Leads = currentTeam.totalTier2Leads
    let totalManualLeads = currentTeam.totalManualLeads
    let tier1Dismissed = currentTeam.tier1Dismissed
    let tier2Dismissed = currentTeam.tier2Dismissed
    let manualDismissed = currentTeam.manualDismissed
    let totalTeamDismissedLeads = currentTeam.dismissedLeads + 1
    if (leadTier === 1) {
      totalTier1Leads--
      tier1Dismissed = tier1Dismissed + 1
    } else if (leadTier === 2) {
      totalTier2Leads--
      tier2Dismissed = tier2Dismissed + 1
    } else {
      totalManualLeads--
      manualDismissed = manualDismissed + 1
    }
    let returnMonthlyStat = {}
    let monthlyStatTeam = await TeamMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("sessionParsed leadsDismissed")
    //* Update most recent monthly stat if its the same month
    if (monthlyStatTeam) {
      returnMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((monthlyStatTeam._id), {
        $inc: { leadsDismissed: 1 }
      }, {new: true})
      await currentTeam.updateOne({
        dismissedLeads: totalTeamDismissedLeads,
        totalTier1Leads: totalTier1Leads,
        totalTier2Leads: totalTier2Leads,
        totalManualLeads: totalManualLeads,
        tier1Dismissed: tier1Dismissed,
        tier2Dismissed: tier2Dismissed,
        manualDismissed: manualDismissed,
        $pull: { [leadType]: leadId },
        $push: { 
          reports: {
            $each: [newReport._id],
            $position: 0,
          }
        }
      })
    //* else create new MonthlyStat if first of the month
    } else {
      let thisMonthNo = moment(todaysDate).month()
      let sessionLabelFull = moment(todaysDate).format('MMM YYYY')
      let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
      let quarter = monthlyStatSession.quarter
      let sessionStr = monthlyStatSession.sessionStr
      let sessionLabel = monthlyStatSession.sessionLabel
      let quarterSession = monthlyStatSession.quarterSession
      let newMonthlyStat = new TeamMonthlyStatsModel({
        belongsToTeam: currentTeam._id,
        sessionParsed: sessionParsed,
        sessionStr: sessionStr,
        sessionLabel: sessionLabel,
        sessionLabelFull: sessionLabelFull,
        monthNo: thisMonthNo,
        quarter: quarter,
        quarterSession: quarterSession,
        leadsDismissed: 1,
      })
      await newMonthlyStat.save()
      returnMonthlyStat = await TeamMonthlyStatsModel.findById(newMonthlyStat._id)
      await currentTeam.updateOne({
        dismissedLeads: totalTeamDismissedLeads,
        totalTier1Leads: totalTier1Leads,
        totalTier2Leads: totalTier2Leads,
        totalManualLeads: totalManualLeads,
        tier1Dismissed: tier1Dismissed,
        tier2Dismissed: tier2Dismissed,
        manualDismissed: manualDismissed,
        $pull: { [leadType]: leadId },
        $push: { 
          reports: {
            $each: [newReport._id],
            $position: 0,
          },
          teamMonthlyStats: {
            $each: [newMonthlyStat._id],
            $position: 0,
          }
        }
      })
    }

    //* Update Mortgage
    let newMortgage = await MortgageModel.findByIdAndUpdate((oldMortgage._id), {
      status: 'inactive',
      activeLead: null,
      activeLeadTier: null,
      $push : {
        reports: {
          $each: [ newReport._id ],
          $position: 0
        },
        timeline: timelineAddition,
      }
    }, { new: true })

    //* Update SweepParameter stats that were present when lead was discovered
    let newParameterStats = []
    let leadUpdates = activeLead.updates
    for (let i = 0; i < leadUpdates.length; i++) {
      let sweepParameter = null
      sweepParameter = await SweepParameterModel.findOneAndUpdate({apiMapping: leadUpdates[i].field}, {$inc: { dismissals: 1 } }, {new: true})
      if (sweepParameter) {
        newParameterStats.push(sweepParameter)
      }
    }

    //* Provided updated team stats
    let teamStats = {
      totalDismissed: currentTeam.dismissedLeads + 1,
      tier1Dismissed: tier1Dismissed,
      tier2Dismissed: tier2Dismissed,
      manualDismissed: manualDismissed,
    }
    if (activeLead.targetOutcome === 'renegotiation') {
      teamStats.outcome = 'renegotiation'
    } else {
      teamStats.outcome = 'refinance'
    }

    //* Remove lead
    let newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
      isActive: false,
      dateDeleted: todaysDate,
      timeline: newTimeline,
      $push: {
        reports: {
          $each: [ newReport._id ],
          $position: 0
        },
      },
    }, {new: true}).populate('belongsToMortgage')

    let thisLog = await handleRequestLog('Log', logTime, 'Lead Dismissed', 'Lead', [{type: 'Report ID', detail: newReport._id}], 'success', false, req.body.userFullName)
    newLog.push(thisLog)
    sendApiSuccessResponse(res, {assigneeUpdateObjs, teamStats, returnMemberMonthlyStats, newLog, leadId, leadStatus, newMortgage, newLead, leadAssigneeIds, newReport, returnMonthlyStat, totalTeamDismissedLeads, newParameterStats}, 'lead dismissed successfully');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Dismiss Lead', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

//TODO: include method to prevent addition of existing ParcelNumbers upon upload
//TODO: in FinalizingLead especially, you have to go through and make it so writes occur once per document per function. Need to miniize writes per function
module.exports = { dismissLead }
