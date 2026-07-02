const moment = require('moment');
const user = require('../../models/user');
const team = require('../../models/team');
const report = require('../../models/report');
const closure = require('../../models/closure');
const leadTag = require('../../models/leadTag');
const mortgage = require('../../models/mortgage');
const activeLead = require('../../models/activeLead');
const cronTicker = require('../../models/cronTicker');
const mortgageTag = require('../../models/mortgageTag');
const uploadReport = require('../../models/uploadReport');
const defaultTiers = require('../../models/defaultTiers');
const sweepParameter = require('../../models/sweepParameter');
const teamMonthlyStats = require('../../models/teamMonthlyStats');
const paymentSchedules = require('../../models/paymentSchedules');
const actionAndErrorLog = require('../../models/actionAndErrorLog');
const actionsPermissions = require('../../models/actionsPermissions');
const memberMonthlyStats = require('../../models/memberMonthlyStats');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const notificationSchedule = require('../../models/notificationSchedule');
const queryPerformanceStats = require('../../models/queryPerformanceStats');
const portfolioMonthlyStats = require('../../models/portfolioMonthlyStats');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function dropAll(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Commencing app launch...')
    let todaysDate = moment(new Date())
    let userFullName = req.body.userFullName

    await user.deleteMany()
    await team.deleteMany()
    await report.deleteMany()
    await closure.deleteMany()
    await leadTag.deleteMany()
    await mortgage.deleteMany()
    await activeLead.deleteMany()
    await cronTicker.deleteMany()
    await mortgageTag.deleteMany()
    await uploadReport.deleteMany()
    await defaultTiers.deleteMany()
    await sweepParameter.deleteMany()
    await paymentSchedules.deleteMany()
    await teamMonthlyStats.deleteMany()
    await actionAndErrorLog.deleteMany()
    await actionsPermissions.deleteMany()
    await memberMonthlyStats.deleteMany()
    await notificationSchedule.deleteMany()
    await portfolioMonthlyStats.deleteMany()
    await queryPerformanceStats.deleteMany()
    
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Log', logTime, 'Database Dropped', 'Database', [{type: 'Entire DB', detail: userFullName}], 'success', false, null, null, null, null)
    sendApiSuccessResponse(res, null, 'Database dropped successfully');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Drop All Database', [{}], error, true, null, null, null, null)
    sendApiErrorResponse(res, null, error)
  }
}

module.exports = { dropAll };
