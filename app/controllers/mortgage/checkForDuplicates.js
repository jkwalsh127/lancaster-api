const moment = require('moment');
const TeamModel = require('../../models/team');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function checkForDuplicates(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info('*** Checking for mortgage duplicates')
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let duplicates = [{}, []]
    let duplicatesNum = 0
    let team = await TeamModel.findById(req.body.teamId).populate("mortgages", '_id streetAddress').select('mortgages')
    let mortgages = team.mortgages
    let loopIndex = mortgages.length
    for (let i = 0; i < (loopIndex - 1); i++) {
      for (let j = 0; j < loopIndex; j++) {
        if (mortgages[i]._id !== mortgages[j]._id) {
          if (mortgages[i].streetAddress === mortgages[j].streetAddress) {
            duplicatesNum++
            duplicates[0] = {discovered: true}
            duplicates[1].push({
              match: mortgages[j].streetAddress,
              message: 'Matching Street Address'
            })
            let thisIndex = mortgages.indexOf(mortgages[i])
            mortgages.splice(thisIndex, 1)
            loopIndex--
          }
        }
      }
    }
    if (duplicates[1].length === 0) {
      duplicates[0] = {discovered: false}
      duplicates[1].push({
        checks: 'Street Address',
      })
    }

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Check for Mortgage Duplicates', 'Mortgages', [{type: 'Duplicate Mortgages', detail: duplicatesNum}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {duplicates, newLog}, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Mortgages', [{type: 'Check for Mortgage Duplicates'}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { checkForDuplicates }