const moment = require('moment');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function saveLeadTargetChanges(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Changing the lead's refinance targets")
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let targetProfitPercent = Math.round(req.body.targetProfitPercent)
    let targetProfitNumber = Math.round(parseFloat(req.body.targetProfitNumber)*100)/100
    let targetMonthlyPayments = Math.round(parseFloat(req.body.targetMonthlyPayments)*100)/100
    let targetInterestDue = Math.round(parseFloat(req.body.targetInterestDue)*100)/100
    let targetInterestRate = Math.round(parseFloat(req.body.targetInterestRate)*100)/100
    let targetLoanAmount = Math.round(parseFloat(req.body.targetLoanAmount)*100)/100
    let targetLoanTerm = parseInt(req.body.targetLoanTerm)
    let newProfits = {
      profitNumber: {
        old: Math.round(req.body.oldTargetProfitNumber * 100) / 100,
        new: Math.round(targetProfitNumber * 100) / 100,
        difference: Math.round(req.body.newProfitNumberDifference.value * 100) / 100,
      },
      profitPercent: {
        old: Math.round(req.body.oldTargetProfitPercent * 100) / 100,
        new: Math.round(targetProfitPercent * 100) / 100,
        difference: Math.round(req.body.newProfitPercentDifference.value * 100) / 100,
      },
      monthlyPayments: {
        old: Math.round(req.body.oldMonthlyPayments * 100) / 100,
        new: Math.round(targetMonthlyPayments) * 100 / 100,
        difference: Math.round(req.body.newMonthlyPaymentsDifference.value * 100) / 100,
      }
    }

    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      date: todaysDateLabel, 
      contributor: req.body.userFullName, 
      milestone: 'Refinance Targets Updated', 
      details: req.body.updatedFields, 
      newProfits: newProfits, 
      notify: false
    }

    let newValues = {
      targetLoanAmount: targetLoanAmount,
      targetLoanTerm: targetLoanTerm,
      targetInterestRate: targetInterestRate,
      targetInterestDue: targetInterestDue,
      targetMonthlyPayments: targetMonthlyPayments,
      targetProfitNumber: targetProfitNumber,
      targetProfitPercent: targetProfitPercent,
    }
    let newLead = await ActiveLeadModel.findByIdAndUpdate((req.body.leadId), {
      targetLoanAmount: targetLoanAmount,
      targetLoanTerm: targetLoanTerm,
      targetInterestRate:targetInterestRate,
      targetInterestDue: targetInterestDue,
      targetMonthlyPayments: targetMonthlyPayments,
      targetProfitNumber: targetProfitNumber,
      targetProfitPercent: targetProfitPercent,
      $push: {
        timeline: timelineAddition
      }
    }, {new: true}).populate('belongsToMortgage');

    let newMortgage = await MortgageModel.findByIdAndUpdate((newLead.belongsToMortgage), {
      $push: { 
        timeline: timelineAddition,
      }
    }, {new: true})

    let leadStatus = newLead.status
    await notifyAssignees(newLead.assigneeIds, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "lead", leadStatus)

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Lead Refinance Targets Updated', 'Lead', [{type: 'Lead ID', detail: newLead._id},{type: 'New Targets', detail: JSON.stringify(newValues)}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newLead, leadStatus, newMortgage}, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Save Target Changes', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { saveLeadTargetChanges };