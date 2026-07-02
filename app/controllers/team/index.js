const moment = require('moment');
const TeamModel = require("../../models/team");
const SweepParameterModel = require("../../models/sweepParameter");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');
const ActionAndErrorLogModel = require("../../models/actionAndErrorLog");

async function updateSecuritySetting(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info(`*** Updating Require2FA setting to ${req.body.require2FA}`)
    console.info(`*** Updating EnforceIPWhitelist setting to ${req.body.enforceIPWhitelist}`)
    let require2FA = req.body.require2FA
    let enforceIPWhitelist = req.body.enforceIPWhitelist
    await TeamModel.findByIdAndUpdate((req.body.teamId), {
      require2FA: require2FA,
      enforceIPWhitelist: enforceIPWhitelist,
    })

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Security Setting Updated', 'Team Settings', [{type: `2FA Setting`, detail: `${require2FA}`}, {type: `IPWhitelist Setting`, detail: `${enforceIPWhitelist}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {require2FA, enforceIPWhitelist, newLog}, 'update successful!')
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Security Setting Updated', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function updateDefaultTargets(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Updating Team's default targets")
    let defaultTargets = {
      defaultTargetTerm: req.body.term,
      defaultTargetInterestRate: req.body.interest,
    }
    await TeamModel.findByIdAndUpdate((req.body.teamId), {
      defaultTargetTerm: defaultTargets.defaultTargetTerm,
      defaultTargetInterestRate: defaultTargets.defaultTargetInterestRate,
    })

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Default Targets Updated', 'Team Settings', [{type: 'Default Targets', detail: `term: ${defaultTargets.defaultTargetTerm}, Rate: ${defaultTargets.defaultTargetInterestRate}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {defaultTargets, newLog}, 'update successful!')
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Update Team Default Targets', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function updateParameterSettings(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Updating Team's parameter settings")
    console.info(`parameterID: ${req.body.parameterId}`)
    let parameterId = req.body.parameterId
    let activeStatus = req.body.status
    let newTier = req.body.newTier
    let originalTier = req.body.originalTier

    let tierChange = false
    if (newTier !== originalTier) {
      tierChange = true
    }
    let newParameter = await SweepParameterModel.findByIdAndUpdate((parameterId), {
      active: activeStatus,
      assignedTier: newTier,
    }, {new: true})

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Parameter Settings Updated', 'Team Settings', [{type: 'details', detail: `tier: ${newTier}, active: ${activeStatus}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {parameterId, newParameter, tierChange, originalTier, newLog }, 'update successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Update Team Sweep Parameter Settings', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function updateParameterActiveStatus(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Updating Parameter's active status")
    console.info(`parameterID: ${req.body.parameterId}`)
    let parameterId = req.body.parameterId;
    let activeStatus = req.body.activeStatus;
    let tier = req.body.tier;
    await SweepParameterModel.findByIdAndUpdate((parameterId), {
      active: activeStatus
    })

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Parameter Active Status Updated', 'Team Settings', [{type: 'parameter active: ', detail: `${activeStatus}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {parameterId, activeStatus, tier, newLog}, 'update successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Update Team Sweep Parameter Active Status', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

async function deleteActionOrErrorLog(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Deleting Action or Error log")
    let logId = req.body.logId
    await ActionAndErrorLogModel.findByIdAndDelete(logId)
    
    sendApiSuccessResponse(res, {logId}, 'delete successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Delete Action or Error Log', [{}], error, false, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { updateSecuritySetting, updateDefaultTargets, updateParameterActiveStatus, updateParameterSettings, deleteActionOrErrorLog }