const moment = require('moment');
const UserModel = require('../../models/user')
const { nanoid } = require('nanoid');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');

async function updateMortgageAssignees(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Adding mortgage assignees")
    console.info(`*** mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let newLead = {}
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      milestone: 'Mortgage Assignees Updated',
      date: todaysDateLabel, 
      contributor: req.body.userFullName, 
      details: [{
        newAssignees: req.body.newAssigneeNames,
        removedAssignees: req.body.removedAssigneeNames,
        previousAssignees: req.body.previousAssigneeNames,
      }],
      notify: false,
    }

    let newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
      assigneeIds: req.body.updatedAssigneeIds,
      assigneeNames: req.body.updatedAssigneeNames,
      $push: { 
        timeline: timelineAddition,
      }
    }, {new: true})
    
    let leadStatus = 'inactive'
    let newAssigneeIds = req.body.newAssigneeIds
    if (req.body.leadId) {
      await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
        $push: { 
          timeline: timelineAddition,
        }
      }, {new: true})
      newLead = await ActiveLeadModel.findById(req.body.leadId).populate('belongsToMortgage')
      leadStatus = newLead.status
      let userNotification = await notifyAssignees(newAssigneeIds, req.body.userId, req.body.mortgageId, req.body.leadId, newTimelineGuid, "mortgageAssigned", leadStatus)
      if (userNotification) {
        newLead.userAssignment = true
        newMortgage.userAssignment = true
      }
      for (let i = 0; i < newAssigneeIds.length; i++) {
        await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
          $push: {
            assignedMortgages: {
              $each: [ req.body.mortgageId, ],
              $position: 0
            },
          },
        })
      }
      let removedAssigneeIds = req.body.removedAssigneeIds
      await notifyAssignees(removedAssigneeIds, req.body.userId, req.body.mortgageId, req.body.leadId, null, "mortgageRemoved", leadStatus)
      for (let i = 0; i < removedAssigneeIds.length; i++) {
        await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
          $pull: { 
            assignedMortgages: mortgageId,
          },
        })
      }
    } else {
      let userNotification = await notifyAssignees(newAssigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgageAssigned", "inactive")
      if (userNotification) {
        newLead.userAssignment = true
        newMortgage.userAssignment = true
      }
      for (let i = 0; i < newAssigneeIds.length; i++) {
        await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
          $push: {
            assignedMortgages: {
              $each: [ req.body.mortgageId, ],
              $position: 0
            },
          },
        })
      }
      let removedAssigneeIds = req.body.removedAssigneeIds
      await notifyAssignees(removedAssigneeIds, req.body.userId, req.body.mortgageId, null, null, "mortgageRemoved", "inactive")
      for (let i = 0; i < removedAssigneeIds.length; i++) {
        await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
          $pull: { 
            assignedMortgages: mortgageId,
          },
        })
      }
    }


    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Assignee Added to Mortgage', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id},{type: 'Assignee IDs', detail: req.body.newAssigneeIds.toString()}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newLead, leadStatus, newMortgage}, 'add assignees successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Assignees Mortgage', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { updateMortgageAssignees }