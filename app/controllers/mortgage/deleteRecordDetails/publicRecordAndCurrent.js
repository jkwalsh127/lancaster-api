const moment = require('moment');
const MortgageModel = require('../../../models/mortgage');
const { handleRequestLog } = require('../../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../../utils/response.utils');

async function publicRecordAndCurrent(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Deleting a mortgag's Public Records")
    console.info(`*** mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let mortgageId = req.body.mortgageId
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let recordDetails = req.body.recordDetails

    for (let j = 0; j < Object.entries(recordDetails).length; j++) {
      for (let k = 0; k < Object.entries(Object.entries(recordDetails)[j][1]).length; k++) {
        Object.entries(Object.entries(recordDetails)[j][1])[k][1].publicRecordValue = ''
        Object.entries(Object.entries(recordDetails)[j][1])[k][1].currentValue = ''
      }
    }
    await MortgageModel.findByIdAndUpdate((mortgageId), {
      recordDetails: recordDetails
    })

    await handleRequestLog('Log', logTime, 'Mortgage Public Records Deleted', 'Mortgages', [{}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, null, 'Mortgage Public Records were confirmed.');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Clear Mortgage Public Records', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

//TODO: make sure all console.infos are recording todaysDate

module.exports = { publicRecordAndCurrent }