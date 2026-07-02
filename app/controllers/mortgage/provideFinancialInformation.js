const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { provideFinancials } = require('../../utils/mortgages/provideFinancials.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function provideFinancialInformation(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Providing Financial Information")
    console.info(`mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let todaysDateISO = todaysDate.toISOString()
    let sessionStr = todaysDateISO.substring(0,7)

    let currentTeam = await TeamModel.findById(req.body.teamId).select("totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining")

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateLabel = todaysDate.format('MMM Do, YYYY')
    let mortgageId = req.body.mortgageId
    let activeLeadId = req.body.activeLeadId
    let newOriginationDate = req.body.newOriginationDate
    let newMortgageTerm = req.body.newMortgageTerm
    let newOriginalLoanAmount = req.body.newOriginalLoanAmount
    let newOriginalInterestRate = req.body.newOriginalInterestRate
    let targetInterestRate = req.body.targetInterestRate
    let leadObj = {}
    let newLead = {}
    let leadStatus = {}
    let mortgageObj = {}
    let leadUpdated = false
    let originalInterestDifference = 0
    let interestRemainingDifference = 0
    let originalLoanAmountDifference = 0
    let principalRemainingDifference = 0

    let newTimelineGuid = nanoid()
    let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'Financial Information Provided', details: [{type: 'Origination Date', detail: newOriginationDate}, {type: 'Term', detail: newMortgageTerm}, {type: 'Loan Amount', detail: newOriginalLoanAmount}, {type: 'Interest Rate', detail: newOriginalInterestRate}], notify: false}
    let newFinancials = await provideFinancials(newOriginationDate, newMortgageTerm, todaysDate, newOriginalLoanAmount, newOriginalInterestRate, newMortgageTerm, targetInterestRate, req.body.assessedValue, fromSweep = false, teamId = null)
    mortgageObj.timeframePresent = true
    mortgageObj.endDate = newFinancials.endDate
    mortgageObj.endDateLabel = newFinancials.endDateLabel
    mortgageObj.remainingTerm = newFinancials.remainingTerm
    mortgageObj.originationDateLabel = newFinancials.originationDateLabel
    mortgageObj.monthsRemaining = newFinancials.diffMonths
    mortgageObj.financialsPresent = true
    mortgageObj.mortgageTerm = newMortgageTerm
    mortgageObj.originationDate = newOriginationDate
    mortgageObj.originalInterestRate = newOriginalInterestRate
    mortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
    mortgageObj.monthlyPayments = newFinancials.monthlyPayments
    mortgageObj.originalTotalDue = newFinancials.originalTotalDue
    mortgageObj.originalInterestDue = newFinancials.originalInterestDue
    mortgageObj.principalPaid = newFinancials.principalPaid
    mortgageObj.interestPaid = newFinancials.interestPaid
    mortgageObj.principalRemaining = newFinancials.principalRemaining
    mortgageObj.interestRemaining = newFinancials.interestRemaining
    mortgageObj.payments = newFinancials.payments
    interestRemainingDifference = newFinancials.interestRemaining
    principalRemainingDifference = newFinancials.principalRemaining
    originalLoanAmountDifference = newFinancials.originalLoanAmount
    originalInterestDifference = newFinancials.originalInterestDue
    mortgageObj.$push = { timeline: timelineAddition }
    let newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), mortgageObj, {new: true})
    if (activeLeadId) {
      leadObj.remainingMonths = newFinancials.diffMonths
      leadObj.targetLoanAmount = newFinancials.principalRemaining
      leadObj.targetInterestDue = newFinancials.targetInterestDue
      leadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
      leadObj.targetProfitNumber = newFinancials.targetProfitNumber
      leadObj.targetProfitPercent = newFinancials.targetProfitPercent
      leadObj.$push = { timeline: timelineAddition }
      newLead = await ActiveLeadModel.findByIdAndUpdate((activeLeadId), leadObj, {new: true}).populate("belongsToMortgage")
      leadUpdated = true
      leadStatus = newLead.status
      await notifyAssignees(newLead.assigneeIds, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "lead", leadStatus)
    } else {
      await notifyAssignees(newMortgage.assigneeIds, req.body.userId, newMortgage._id, null, newTimelineGuid, "mortgage", "inactive")
    }
    let newLog = await handleRequestLog('Log', logTime, 'Financial Information Provided', 'Mortgage', [{type: 'Origination Date', detail: newOriginationDate}, {type: 'Term', detail: newMortgageTerm}, {type: 'Loan Amount', detail: newOriginalLoanAmount}, {type: 'Interest Rate', detail: newOriginalInterestRate}], 'success', false, req.body.userFullName)

    let teamUpdateObj = {
      $inc: { 
        totalOriginalLoanAmount: originalLoanAmountDifference,
        totalOriginalInterest: originalInterestDifference,
        totalPrincipalRemaining: principalRemainingDifference,
        totalInterestRemaining: interestRemainingDifference,
      },
    }
    if (newFinancials.newPortfolioStats.length > 0) {
      teamUpdateObj.$push = {
        portfolioMonthlyStats: {
          $each: newFinancials.newPortfolioStats,
        },
      }
    }

    await currentTeam.updateOne(teamUpdateObj)

    sendApiSuccessResponse(res, {newLog, newMortgage, leadUpdated, newLead, leadStatus}, 'update successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Provide Financial Information', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { provideFinancialInformation }