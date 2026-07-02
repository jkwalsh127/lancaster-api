const moment = require('moment');
const TeamModel = require("../../models/team");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function fetchAllPortfolioMonthlyStats(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Fetching All Portfolio Monthly Stats")

    let team = await TeamModel.findById(req.body.teamId).populate('portfolioMonthlyStats')
    let teamPortfolioMonthlyStats = team.portfolioMonthlyStats
    let thisDate = new Date()
    let thisDateToParse = Date.parse(new Date())

    let loopNum = teamPortfolioMonthlyStats.length - 1
    let returnTeamPortfolioMonthlyStats = []
    let arrayIndex = loopNum
    for (let i = loopNum; i > -1; i--) {
      let noMonth = true
      if (teamPortfolioMonthlyStats[arrayIndex]) {
        noMonth = false
        returnTeamPortfolioMonthlyStats.push(teamPortfolioMonthlyStats[arrayIndex])
      }
      if (noMonth) {
        let emptyMonthDateLabel = '';
        if (moment(thisDate).subtract(loopNum, 'months').month() === 0) {
          emptyMonthDateLabel = moment(thisDate).subtract(loopNum, 'months').format('YYYY');
        } else {
          emptyMonthDateLabel = moment(thisDate).subtract(loopNum, 'months').format('MMM');
        }
        let sessionLabelFull = moment(thisDateToParse).subtract(loopNum, 'months').format('MMM YYYY');
        let emptyMonth = {
          sessionLabel: emptyMonthDateLabel,
          sessionLabelFull: sessionLabelFull,
          numberOfMortgages: 0,
          totalOriginalLoanAmount: 0,
          totalOriginalInterest: 0,
          totalMarketPropertyValue: 0,
          totalAssessedPropertyValue: 0,
          totalPrincipalRemaining: 0,
          totalInterestRemaining: 0,
        }
        returnTeamPortfolioMonthlyStats.push(emptyMonth)
      }
      arrayIndex--
      loopNum--
    }
        
    sendApiSuccessResponse(res, {returnTeamPortfolioMonthlyStats}, "success")
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Reload Lead Generations Quarter Breakdown', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { fetchAllPortfolioMonthlyStats }