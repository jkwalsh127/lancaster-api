const moment = require('moment');
const UserModel = require('../../models/user');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function addMortgageNote(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Adding a note to the mortgage")
    console.info(`mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let leadStatus = ''
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let leadId = req.body.leadId
    let requestOrigin = req.body.requestOrigin
    let newNote = {
      content: req.body.note,
      date: todaysDateLabel,
      author: req.body.author
    }
    let newTimelineGuid = nanoid()
    let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.author, milestone: 'Note Added', details: req.body.note, notify: false}
    let updateMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
      $push: { 
        timeline: timelineAddition,
        mortgageNotes: {
          $each: [ newNote ],
          $position: 0
        },
      },
    }, { new: true })

    let newLead = {}
    if (requestOrigin !== 'repository') {
      newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
        $push: { 
          timeline: timelineAddition,
        }
      }, {new: true}).populate('belongsToMortgage')
    }

    if (newLead) {
      leadStatus = newLead.status
      let assigneeNames = []
      if (newLead.status === 'investigating' || newLead.status === 'closing') {
        for (let i = 0; i < newLead.assigneeIds.length; i++) {
          let assignee = await UserModel.findById(newLead.assigneeIds[i]).select('fullName')
          assigneeNames.push(assignee.fullName)
        }
      }
      await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, newLead._id, newTimelineGuid, "lead", leadStatus)
    } else {
      await notifyAssignees(updateMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "incative")
    }

    let newMortgage = updateMortgage
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Mortgage Note Added', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id}, {type: 'Author', detail: req.body.author}], 'success', false, req.body.author)
    sendApiSuccessResponse(res, {newLog, newMortgage, leadStatus, newLead, leadId}, 'update successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Mortgage Note', [{}], error, true, req.body.author)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { addMortgageNote }