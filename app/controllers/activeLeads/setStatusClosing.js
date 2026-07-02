const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require("../../utils/notifyAssignees.utils");
const { updateLeadStatus } = require("../../utils/updateLeadStatus.utils");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');


async function setStatusClosing(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info('*** Setting the lead as closing')
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let leadId = req.body.leadId;
    let teamId = req.body.teamId;
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY");

    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      date: todaysDateLabel, 
      contributor: req.body.userFullName, 
      milestone: 'Closing the Investigation', 
      notify: false
    }

    let newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
      status: 'closing',
      $push: { timeline: timelineAddition }
    }, {new: true})

    let newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
      status: 'closing',
      $push: {
        timeline: timelineAddition,
      }
    }, { new: true }).populate('belongsToMortgage');

    await TeamModel.findByIdAndUpdate((teamId), {
      $pull: { investigatingLeads: leadId },
      $push: { 
        closingLeads: {
          $each: [ leadId  ],
          $position: 0
        },
       }
    });

    let assigneeIds = newLead.assigneeIds
    await updateLeadStatus(assigneeIds, req.body.leadId, newLead.status)
    await notifyAssignees(assigneeIds, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "lead", "closing")

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Lead Closing', 'Lead', [{type: 'Lead ID', detail: newLead._id}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {assigneeIds, newLog, newLead, newMortgage}, 'lead status change successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Close Lead', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { setStatusClosing }