const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const MortgageTagModel = require('../../models/mortgageTag');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { RequestValidation } = require('../RequestValidation');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function updateMortgageTags(req, res) {
  try {
    //* Validate Request Body
    let newReqBody = {}
    for (let j = 0; j < Object.entries(req.body).length; j++) {
      let newKey = Object.entries(req.body)[j][0]
      newReqBody[newKey] = `${Object.entries(req.body)[j][1]}`
      let newKeyNullable = `${newKey + 'IsNullable'}`
      newReqBody[newKeyNullable] = false
    }
    let validateRequest = await RequestValidation(newReqBody)
    if (!validateRequest.isSuccess) {
      sendApiSuccessResponse(res, null, 'Invalid request body')
    } else {
      console.info('-----------------------------------')
      console.info('-----------------------------------')
      console.info(`*** ${req.body.userFullName} is:`)
      console.info("*** Adding a tag to the mortgage")
      console.info(`mortgageID: ${req.body.mortgageId}`)
      let todaysDate = moment(new Date())
      console.info(`Time: ${todaysDate}`)

      let action = req.body.action
      let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
      let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
      let timelineAddition = {}
      let newTimelineGuid = nanoid()
      let newMortgage = {}
      let newLead = {}
      let newTag = {}
      let newLog = {}
      let leadStatus = ''
      if (action === 'create') {
        let newMapping = req.body.tagTitle.toLowerCase()
        newMapping = newMapping.split(" ").reduce((s, c) => s + (c.charAt(0).toUpperCase() + c.slice(1)))
        let newTagObj = {
          label: req.body.tagTitle,
          apiMapping: newMapping,
          description: req.body.tagDescription,
          currentAssignments: 1,
          origin: 'created,'
        }
        if (req.body.reqOrigin === 'lead') {
          newTagObj.activeLeads = 1
        } else {
          newTagObj.activeLeads = 0
        }
        newTag = new MortgageTagModel(newTagObj)
        await newTag.save()
        await TeamModel.findByIdAndUpdate((req.body.teamId), {
          $push: { mortgageTags: newTag._id }
        })
        timelineAddition = {
          guid: newTimelineGuid,
          date: todaysDateLabel, 
          contributor: req.body.userFullName, 
          milestone: 'Mortgage Tag Created & Assigned', 
          details: {
            label: newTag.label,
            description: req.body.tagDescription,
          },
          notify: false
        }
        newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
          tagAdded: true,
          $push: { 
            tags: {
              status: 'manual',              
              tagId: newTag._id,
              label: req.body.tagTitle,
              description: req.body.tagDescription,
              discrepancyFields: [],
              apiMapping: newMapping,
            },
            timeline: timelineAddition,
          }
        }, {new: true})
        if (req.body.leadId) {
          await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
            $push: { timeline: timelineAddition }
          })
          newLead = await ActiveLeadModel.findById(req.body.leadId).populate('belongsToMortgage')
          leadStatus = newLead.status
          await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, newLead._id, newTimelineGuid, "lead", leadStatus)
        } else {
          await notifyAssignees(newMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "inactive")          
        }
        newLog = await handleRequestLog('Log', logTime, 'Tag Created & Assigned', 'Mortgage', [{type: 'Tag ID', detail: newTag._id}], 'success', false, req.body.userFullName)
      } else {
        if (req.body.reqOrigin === 'lead') {
          newTag = await MortgageTagModel.findByIdAndUpdate((req.body.newTag), {
            $inc: { currentAssignments: 1, activeLeads: 1 }
          })
        } else {
          newTag = await MortgageTagModel.findByIdAndUpdate((req.body.newTag), {
            $inc: { currentAssignments: 1 }
          })
        }
        timelineAddition = {
          guid: newTimelineGuid,
          date: todaysDateLabel, 
          contributor: req.body.userFullName, 
          milestone: 'Mortgage Tag Assigned', 
          details: {
            label: newTag.label,
          },
          notify: false
        }
        newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
          tagAdded: true,
          $push: {
            tags: {
              status: 'manual',              
              tagId: newTag._id,
              label: newTag.label,
              discrepancyFields: newTag.discrepancyFields,
              apiMapping: newTag.apiMapping,
              origin: newTag.origin,
            },
            timeline: timelineAddition,
          }
        }, {new: true})
        if (req.body.leadId) {
          await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
            $push: { timeline: timelineAddition }
          })
          newLead = await ActiveLeadModel.findById(req.body.leadId).populate('belongsToMortgage')
          leadStatus = newLead.status
          await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, newLead._id, newTimelineGuid, "lead", leadStatus)          
        } else {
          await notifyAssignees(newMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "inactive")          
        }
        newLog = await handleRequestLog('Log', logTime, 'Mortgage Tag Assigned', 'Mortgage', [{type: 'Tag ID', detail: newTag._id}], 'success', false, req.body.userFullName)
      }
  
      sendApiSuccessResponse(res, {newLog, newMortgage, newLead, newTag, action, leadStatus}, 'update successful!');
      console.info("*** Success")
      console.info('')
    }
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Mortgage Tag', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { updateMortgageTags }