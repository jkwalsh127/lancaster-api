const moment = require('moment');
const UserModel = require('../../models/user');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function changeTargetOutcome(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Changing the lead's target outcome")
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let userId = req.body.userId;
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY");
    let newOutcome = '';
    if (req.body.newOutcome === 'renegotiation') {
      newOutcome = 'Renegotiation'
    } else {
      newOutcome = 'Refinance'
    }
    if (req.body.oldOutcome === 'unassigned') {
      newMilestone = 'Target Outcome Assigned'
    } else {
      newMilestone = 'Target Outcome Updated'
    }
    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      date: todaysDateLabel,
      contributor: req.body.userFullName,
      milestone: newMilestone,
      details: [newOutcome],
      notify: false
    }

    let newLead = await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
      targetOutcome: newOutcome,
      $push: { 
        timeline: timelineAddition 
      },
    }, {new: true}).populate('belongsToMortgage');

    let newMortgage = await MortgageModel.findByIdAndUpdate((newLead.belongsToMortgage), {
      $push: { 
        timeline: timelineAddition,
      }
    }, {new: true})

    let assigneeNames = [];
    for (let i = 0; i < newLead.assigneeIds.length; i++) {
      let assignee = await UserModel.findById(newLead.assigneeIds[i]).select('fullName');
      assigneeNames.push(assignee.fullName)
    }

    let leadStatus = newLead.status
    await notifyAssignees(newLead.assigneeIds, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "lead", leadStatus)

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Lead Target Outcome Updated', 'Lead', [{type: 'Lead ID', detail: newLead._id},{type: 'Outcome', detail: newOutcome}], 'success', false, userId)
    sendApiSuccessResponse(res, {newLog, newLead, leadStatus, newMortgage}, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Change Lead Target Outcome', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { changeTargetOutcome }