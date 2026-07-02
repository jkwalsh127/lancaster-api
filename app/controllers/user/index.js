const moment = require('moment');
const UserModel = require('../../models/user');
const TeamModel = require('../../models/team');
const ActiveLeadModel = require('../../models/activeLead');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const ActionsPermissionsModel = require('../../models/actionsPermissions');
const NotificationScheduleModel = require('../../models/notificationSchedule');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function selectRolePermissions(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info(`*** Changing Current Role Permissions to ${req.body.role}`)

    let permissionsObj = await ActionsPermissionsModel.findOne({belongsToRole: `${req.body.role}`})

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Change Current Role Permissions', 'App Settings', [{type: 'New Role', detail: `${req.body.role}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {permissionsObj, newLog}, 'update successful!')
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Change Current Role Permissions', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function removeReportNotification(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Removing Report Notification")
    console.info(`*** userId: ${req.body.userId}`)
    let reportId = req.body.reportId
    await UserModel.findByIdAndUpdate((req.body.userId), {
      $pull: {
        newReports: reportId
      }
    });
    sendApiSuccessResponse(res, null, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Remove Report Notification', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function removeLeadNotification(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Removing Lead Notification")
    console.info(`*** userId: ${req.body.userId}`)
    let leadId = req.body.leadId

    sendApiSuccessResponse(res, null, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Remove Lead Notification', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function removeNewAssignmentNotification(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Remove New Assignment notification")
    console.info(`*** userId: ${req.body.userId}`)
    let leadId = req.body.leadId

    sendApiSuccessResponse(res, null, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Remove New Assignment Notification', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function deleteUser(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Deleting User")
    console.info(`*** userId: ${req.body.deletedUserId}`)
    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let deletedUserId = req.body.deletedUserId
    let deletedUser = await UserModel.findById(deletedUserId)
    let updatedLeads = []
    for (let i = 0; i < deletedUser.notificationSchedule.length; i++) {
      await NotificationScheduleModel.findByIdAndDelete(deletedUser.notificationSchedule[i])
    }
    for (let i = 0; i < deletedUser.closingLeads.length; i++) {
      updatedLeads.push(deletedUser.closingLeads[i])
      await ActiveLeadModel.findByIdAndUpdate((deletedUser.closingLeads[i]), {
        $pull: { assigneeIds: deletedUserId }
      })
    }
    for (let i = 0; i < deletedUser.investigatingLeads.length; i++) {
      updatedLeads.push(deletedUser.investigatingLeads[i])
      await ActiveLeadModel.findByIdAndUpdate((deletedUser.investigatingLeads[i]), {
        $pull: { assigneeIds: deletedUserId }
      })
    }
    for (let i = 0; i < deletedUser.awaitingActionLeads.length; i++) {
      updatedLeads.push(deletedUser.awaitingActionLeads[i])
      await ActiveLeadModel.findByIdAndUpdate((deletedUser.awaitingActionLeads[i]), {
        $pull: { assigneeIds: deletedUserId }
      })
    }

    await TeamModel.findByIdAndUpdate((deletedUser.team), {
      $pull: { members: deletedUserId },
    })

    await UserModel.findByIdAndUpdate((deletedUserId), {
      isActive: false,
      dateDeleted: todaysDate,
    })

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Data', logTime, 'Admin Dash', 'User Deleted', [{}], 'success', false, req.body.userFullName)

    sendApiSuccessResponse(res, { newLog, deletedUserId, updatedLeads }, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Remove New Assignment Notification', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { removeReportNotification, removeLeadNotification, removeNewAssignmentNotification, deleteUser, selectRolePermissions };
