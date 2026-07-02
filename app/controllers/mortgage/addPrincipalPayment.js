const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { updateFinancials } = require('../../utils/mortgages/updateFinancials.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function addPrincipalPayment(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Adding a note to the mortgage")
    console.info(`mortgageID: ${req.body.mortgageId}`)
    console.info(`Time: ${new Date()}`)

    let todaysDateLabel = moment(new Date()).format("MMM Do, YYYY")
    let paymentYear = moment(req.body.paymentDate).year()
    let paymentMonth = moment(req.body.paymentDate).month()

    let mortgage = await MortgageModel.findById(req.body.mortgageId).select('originationDate originalLoanAmount originalInterestRate mortgageTerm payments originalInterestDue principalRemaining interestRemaining assessedPropertyValue')
    let team = TeamModel.findById(req.body.teamId).select('totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining mortgages')

    let newTimelineGuid = nanoid()
    let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'Principal Only Payment Added', details: {date: req.body.paymentDate, paymentAmount: req.body.paymentAmount}, notify: false}

    let newFinancials = await updateFinancials(
      mortgage.originationDate,
      mortgage.originalLoanAmount,
      mortgage.originalInterestRate,
      mortgage.mortgageTerm,
      mortgage.originalInterestRate,
      mortgage.payments,
      paymentYear,
      paymentMonth,
      req.body.paymentAmount,
      mortgage.assessedPropertyValue,
      req.body.newTeamId,
    )

    let newMortgageObj = {
      principalPaid: newFinancials.principalPaid,
      principalRemaining: newFinancials.principalRemaining,
      interestRemaining: newFinancials.interestRemaining,
      payments: newFinancials.payments,
      $push: { timeline: { timelineAddition } },
    }

    let interestRemainingDifference = newFinancials.interestRemaining - mortgage.interestRemaining
    let principalRemainingDifference = newFinancials.principalRemaining - mortgage.principalRemaining
    let originalLoanAmountDifference = newFinancials.originalLoanAmount - mortgage.originalLoanAmount
    let originalInterestDifference = newFinancials.originalInterestDue - mortgage.originalInterestDue
    
    let teamUpdateObj = {}
    teamUpdateObj.$inc = {
      totalOriginalLoanAmount: originalLoanAmountDifference,
      totalOriginalInterest: originalInterestDifference,
      totalPrincipalRemaining: principalRemainingDifference,
      totalInterestRemaining: interestRemainingDifference,
    }
    if (newFinancials.newPortfolioStats.length > 0) {
      teamUpdateObj.$push = {
        $each: newFinancials.newPortfolioStats,
      }
    }

    await team.updateOne(teamUpdateObj)
    let newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, { new: true })

    let logTime = moment(new Date()).format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Mortgage Principal Only Payment Added', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id}, {type: 'User', detail: req.body.userFullName}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newMortgage}, 'update successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Mortgage Note', [{}], error, true, req.body.author)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { addPrincipalPayment }