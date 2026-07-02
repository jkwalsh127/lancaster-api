const moment = require('moment');
const UserModel = require("../../models/user");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function updateUserDefaultLocations(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info(`*** Updating their default State to ${req.body.newDefaultState} and default City to ${req.body.newDefaultCity}`)
    let newDefaultState = req.body.newDefaultState
    let newDefaultCity = req.body.newDefaultCity
    await UserModel.findByIdAndUpdate((req.body.userId), {
      defaultState: newDefaultState,
      defaultCity: newDefaultCity,
    })

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'User default locations', 'User Settings', [{type: `Default State`, detail: `${newDefaultState}`},{type: `Default City`, detail: `${newDefaultCity}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newDefaultState, newDefaultCity, newLog}, 'update successful!')
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'User default locations', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { updateUserDefaultLocations }