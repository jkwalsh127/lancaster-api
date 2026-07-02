const moment = require('moment');
const TeamModel = require("../../models/team");
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { loadTeamPortfolioMonthlyStats } = require('../../utils/Load/teamPortfolioMonthlyStats');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function reloadPortfolioMonthlyStats(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Fetching All Portfolio Monthly Stats")

    let team = await TeamModel.findById(req.body.teamId).populate('portfolioMonthlyStats')
    let thisDate = new Date()
    let thisDateToParse = Date.parse(new Date())

    //* Portfolio Monthly Stats
    let teamPortfolioMonthlyStats = await loadTeamPortfolioMonthlyStats(team.portfolioMonthlyStats, thisDate, thisDateToParse)
    let teamPortfolioMonthlyStatsAll = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsAll
    let teamPortfolioMonthlyStatsTwoYear = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsTwoYear
    let teamPortfolioMonthlyStatsOneYear = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsOneYear

    sendApiSuccessResponse(res, {teamPortfolioMonthlyStatsAll, teamPortfolioMonthlyStatsTwoYear, teamPortfolioMonthlyStatsOneYear}, "success")
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

module.exports = { reloadPortfolioMonthlyStats }