const moment = require('moment');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { updateLeadAssignees } = require('../../utils/updateLeadAssignees.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function addLeadAssignees(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Adding assignees")
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let newAssigneeIds = req.body.newAssigneeIds
    let removedAssigneeIds = req.body.removedAssigneeIds

    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      milestone: 'Lead Assignees Updated',
      date: todaysDateLabel, 
      contributor: req.body.userFullName, 
      details: [{
        newAssignees: req.body.newAssigneeNames,
        removedAssignees: req.body.removedAssigneeNames,
        previousAssignees: req.body.previousAssigneeNames,
      }],
      notify: false,
    }

    let newLead = await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
      assigneeIds: req.body.updatedAssigneeIds,
      assigneeNames: req.body.updatedAssigneeNames,
      $push: {
        timeline: timelineAddition
      }
    }, {new: true}).populate('belongsToMortgage')
    let leadStatus = newLead.status
    
    let newMortgage = await MortgageModel.findByIdAndUpdate((newLead.belongsToMortgage._id), {
      assigneeIds: req.body.updatedAssigneeIds,
      assigneeNames: req.body.updatedAssigneeNames,
      $push: { timeline: timelineAddition }
    }, {new: true})
    let activeDiscrepancies = newMortgage.activeDiscrepancies
      
    let userNotification = await notifyAssignees(newAssigneeIds, req.body.userId, newLead.belongsToMortgage._id, req.body.leadId, newTimelineGuid, "leadAssigned", leadStatus)
    if (userNotification) {
      newLead.userAssignment = true
    }
    await notifyAssignees(removedAssigneeIds, req.body.userId, newLead.belongsToMortgage._id, req.body.leadId, null, "leadRemoved", leadStatus)
    userNotification = await updateLeadAssignees(newAssigneeIds, removedAssigneeIds, req.body.leadId, newLead.status)
    if (userNotification) {
      newLead.userAssignment = true
    }

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Assignee Added to Lead', 'Lead', [{type: 'Lead ID', detail: newLead._id},{type: 'Assignee IDs', detail: req.body.updatedAssigneeIds.toString()}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, activeDiscrepancies, newLead, leadStatus, newMortgage, removedAssigneeIds, newAssigneeIds}, 'add assignees successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Assignees Lead', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { addLeadAssignees }