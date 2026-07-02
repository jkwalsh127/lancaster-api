const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid')
const LeadTagModel = require('../../models/leadTag')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function addLeadTag(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Adding a tag to the lead")
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let action = req.body.action
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY");
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let timelineAddition = {}
    let newTimelineGuid = nanoid()
    let newLead = {}
    let newTag = {}
    let newLog = {}
    if (action === 'create') {
      let newMapping = req.body.tagTitle.toLowerCase()
      newMapping = newMapping.split(" ").reduce((s, c) => s + (c.charAt(0).toUpperCase() + c.slice(1)))
      let tagFields = []
      if (req.body.newTier1.length > 0) {
        tagFields.push(...req.body.newTier1)
      } 
      if (req.body.newTier1.length > 0) {
        tagFields.push(...req.body.newTier2)
      }
      if (req.body.newTier1.length > 0) {
        tagFields.push(...req.body.newTier3)
      }
      newTag = new LeadTagModel({
        label: req.body.tagTitle,
        apiMapping: newMapping,
        description: req.body.tagDescription,
        discrepancyFields: tagFields,
        currentAssignments: 1,
        activeLeads: 1,
        origin: 'created',
      })
      await newTag.save()
      await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $push: { leadTags: newTag._id }
      })
      timelineAddition = {
        guid: newTimelineGuid,
        date: todaysDateLabel,
        contributor: req.body.userFullName,
        milestone: 'Lead Tag Created & Assigned', 
        details: {
          label: newTag.label,
          description: req.body.tagDescription,
        },
        notify: false
      }
      newLead = await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
        tagAdded: true,
        $push: { 
          tags: {
            status: 'manual',
            tagId: newTag._id,
            label: req.body.tagTitle,
            description: req.body.tagDescription,
            discrepancyFields: tagFields,
            origin: newTag.origin,
            apiMapping: newMapping,
          },
          timeline: timelineAddition,
        }
      })
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
        $push: { timeline: timelineAddition }
      }, {new: true})
      newLog = await handleRequestLog('Log', logTime, 'Lead Tag Created & Assigned', 'Active Lead', [{type: 'Tag ID', detail: newTag._id}], 'success', false, req.body.userFullName)
    } else {
      newTag = await LeadTagModel.findByIdAndUpdate((req.body.newTag), {
        $inc: { currentAssignments: 1, activeLeads: 1 }
      }, {new: true})
      timelineAddition = {
        guid: newTimelineGuid,
        date: todaysDateLabel,
        contributor: req.body.userFullName,
        milestone: 'Lead Tag Assigned', 
        details: {
          label: newTag.label,
        },
        notify: false
      }
      await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
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
      })
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
        $push: { timeline: timelineAddition }
      }, {new: true})
      newLog = await handleRequestLog('Log', logTime, 'Lead Tag Assigned', 'Active Lead', [{type: 'Tag ID', detail: newTag._id}], 'success', false, req.body.userFullName)
    }

    newLead = await ActiveLeadModel.findById(req.body.leadId).populate('belongsToMortgage')
    let leadStatus = newLead.status

    await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, req.body.leadId, newTimelineGuid, "lead", leadStatus)

    sendApiSuccessResponse(res, {newTag, newLead, newLog, action, leadStatus, newMortgage}, 'tag added to lead.');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Lead Tag', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { addLeadTag }