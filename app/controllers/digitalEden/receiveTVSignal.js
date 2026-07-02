const moment = require('moment');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function receiveTVSignal(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Receiving Trading View signal...')

    console.log(req)

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Log', logTime, 'Digital Eden', 'Receive Signal', [{type: 'Request', detail: JSON.stringify(req)}], 'success', false, null, null, null, null)
    sendApiSuccessResponse(res, null, 'Signal received successfully');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Launch Team', [{}], error, true, null, null, null, null)
    sendApiErrorResponse(res, null, error)
  }
}

module.exports = { receiveTVSignal };
