const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { updateLeadStatus } = require('../../utils/updateLeadStatus.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');
const { updateTimeframe } = require('../../utils/mortgages/updateTimeframe.utils');

async function setStatusInvestigating(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Starting a Lead's investigation")
    console.info(`*** mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)
    
    let requestOrigin = req.body.requestOrigin
    let leadMortgage = await MortgageModel.findById(req.body.mortgageId)
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let newLead = {}
    let assigneeIds = req.body.assigneeIds
    let previousleadAssignees = []
    let timelineAddition = {}
    let filteredAssignees = assigneeIds
    let newAssigneeIds = {}
    let leadObj = {
      status: 'investigating',
      assigneeIds: assigneeIds,
      assigneeNames: req.body.assigneeNames,
      dateInvestigating: todaysDateLabel,
      targetOutcome: req.body.targetOutcome,
    }
    let mortgageObj = {
      status: 'investigating',
    }
    let newLeadTargetInterestRate = 0
    let newMilestone = ''
    let newTimelineGuid = nanoid()
    if (requestOrigin !== 'repository') {
      if (req.body.targetOutcome === 'renegotiation') {
        newMilestone = 'Renegotiation Investigation Opened'
      } else {
        newMilestone = 'Refinance Investigation Opened'
      }
      newLeadTargetInterestRate = req.body.existingTargetInterestRate
      timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: newMilestone, details: req.body.assigneeNames, notify: false}
      mortgageObj.$push = {timeline: timelineAddition}
      leadObj.$push = {timeline: timelineAddition}
      let thisLead = await ActiveLeadModel.findById(req.body.leadId).select("assigneeIds")
      if (thisLead) {
        previousleadAssignees = thisLead.assigneeIds
        for (let i = 0; i < previousleadAssignees.length; i++) {
          newAssigneeIds = filteredAssignees.filter(assignee => assignee !== previousleadAssignees[i])
          filteredAssignees = newAssigneeIds
        }
      }
    } else {
      if (req.body.targetOutcome === 'renegotiation') {
        newMilestone = 'Manual Renegotiation Investigation Opened'
      } else {
        newMilestone = 'Manual Refinance Investigation Opened'
      }
      newLeadTargetInterestRate = req.body.defaultTargetInterestRate
      timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: newMilestone, details: req.body.assigneeNames, notify: false}
      mortgageObj.$push = {timeline: timelineAddition}
      leadObj.timeline = [timelineAddition],
      leadObj.dateCreated = logTime
      leadObj.belongsToTeam = req.body.teamId
      leadObj.belongsToMortgage = leadMortgage._id
      leadObj.status = 'investigating'
      leadObj.tier = 5
      leadObj.dateDiscovered = todaysDate
      leadObj.dateDiscoveredLabel = todaysDateLabel
      leadObj.targetInterestRate = newLeadTargetInterestRate
      leadObj.targetLoanTerm = req.body.defaultTargetLoanTerm
      leadObj.reports = leadMortgage.reports
      leadObj.targetOutcome = req.body.targetOutcome
      leadObj.assigneeNames = req.body.assigneeNames
      leadObj.dateInvestigating = todaysDateLabel
    }

    if ((leadMortgage.originationDate.length > 0) && leadMortgage.mortgageTerm > 0) {
      let newTimeframe = await updateTimeframe(leadMortgage.originationDate, leadMortgage.mortgageTerm, todaysDate)  
      leadObj.remainingMonths = newTimeframe.diffMonths
      if (leadMortgage.originalLoanAmount > 0 && leadMortgage.originalInterestRate > 0 && newLeadTargetInterestRate > 0) {
        let targetMonthlyInterestRate = (newLeadTargetInterestRate/12)/100
        let targetInterestDue = (Math.round((leadMortgage.originalTotalDue-leadMortgage.principalRemaining)*10000)/10000)
        let targetMonthlyPayment = (Math.round(((leadMortgage.principalRemaining*(targetMonthlyInterestRate*((1+targetMonthlyInterestRate)**(parseFloat(leadMortgage.mortgageTerm)*12))))/(((1+targetMonthlyInterestRate)**(parseFloat(leadMortgage.mortgageTerm)*12))-1))*10000)/10000)
        let targetProfitNumber = (Math.round((targetInterestDue - leadMortgage.interestRemaining)*10000)/10000)
        let targetProfitPercent = (Math.round(((targetInterestDue/leadMortgage.interestRemaining)*100)-100)*10000)/10000
        leadObj.targetInterestDue = targetInterestDue
        leadObj.targetMonthlyPayments = targetMonthlyPayment
        leadObj.targetProfitNumber = targetProfitNumber
        leadObj.targetProfitPercent = targetProfitPercent
      } else {
        mortgageObj.financialsPresent = false
      }
    } else {
      mortgageObj.timeframePresent = false
    }
    let newMortgage = {}
    if (requestOrigin !== 'repository') {
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), mortgageObj, {new: true})
      newLead = await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), leadObj, { new: true }).populate('belongsToMortgage')
      await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $pull: { leadsAwaitingAction: newLead._id },
        $push: { 
          investigatingLeads: {
            $each: [ newLead._id ],
            $position: 0
          },
        }
      })
    } else {
      let createLead = new ActiveLeadModel(leadObj)
      await createLead.save()
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), mortgageObj, {new: true})
      await TeamModel.findByIdAndUpdate((req.body.teamId), {
        activeLead: newLead._id,
        $push: { 
          investigatingLeads: {
            $each: [ newLead._id ],
            $position: 0
          },
        }
      })
      newLead = await ActiveLeadModel.findById(createLead._id).populate('belongsToMortgage')
      mortgageObj.activeLeadTier = newLead.tier
      mortgageObj.activeLead = newLead._id
    }

    await updateLeadStatus(assigneeIds, newLead._id, newLead.status)
    await notifyAssignees(filteredAssignees, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "leadAssigned", "investigating")
    await notifyAssignees(previousleadAssignees, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "lead", "investigating")

    let newLog = await handleRequestLog('Log', logTime, 'Lead Investigating', 'Lead', [{type: 'Lead ID', detail: newLead._id}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {assigneeIds, newLog, newLead, newMortgage, requestOrigin, previousleadAssignees}, 'lead status change successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Investigate Lead', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { setStatusInvestigating }