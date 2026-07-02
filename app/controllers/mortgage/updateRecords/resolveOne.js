const moment = require('moment');
const TeamModel = require('../../../models/team');
const { nanoid } = require('nanoid');
const MortgageModel = require('../../../models/mortgage');
const ActiveLeadModel = require('../../../models/activeLead');
// const { formatDates } = require('../../../utils/formatDates.utils');
const { notifyAssignees } = require('../../../utils/notifyAssignees.utils');
// const { updateTimeframe } = require('../../../utils/mortgages/updateTimeframe.utils');
const { handleRequestLog } = require('../../../utils/logHandling.utils');
// const { updateFinancials } = require('../../../utils/mortgages/updateFinancials.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../../utils/response.utils');

async function resolveOne(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Updating the mortgage's record details")
    console.info(`mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let todaysDateLabel = todaysDate.format('MMM Do, YYYY');
    let leadId = req.body.leadId
    let selection = req.body.selection
    let recordField = req.body.recordField
    let userFullName = req.body.userFullName
    let oldDiscrepancy = req.body.oldDiscrepancy
    let recordFieldRoot = req.body.recordFieldRoot
    let activeDiscrepancies = req.body.activeDiscrepancies
    let rejectedDiscrepancies = req.body.rejectedDiscrepancies
    let resolvedDiscrepancies = req.body.resolvedDiscrepancies
    let oldLead = {}
    let newLead = {}
    let newLeadObj = {}
    let newMortgage = {}
    let oldMortgage = {}
    let newMortgageObj = {}
    let leadStatus = req.body.leadStatus
    // if (req.body.financialsUpdated) {
    //   oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails timeline originalLoanAmount originalInterestRate originationDate mortgageTerm')
    //   let newMortgageTerm = oldMortgage.mortgageTerm
    //   let newOriginationDate = oldMortgage.originationDate
    //   let newOriginalLoanAmount = oldMortgage.originalLoanAmount
    //   let newOriginalInterestRate = oldMortgage.originalInterestRate
    //   if (req.body.recordField === 'PrimaryMortgageAmount') {
    //     newOriginalLoanAmount = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    //     newMortgageObj.originalLoanAmount = newOriginalLoanAmount
    //   } else if (req.body.recordField === 'PrimaryMortgageInterestRate') {
    //     newOriginalInterestRate = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    //     newMortgageObj.originalInterestRate = newOriginalInterestRate
    //   } else if (req.body.recordField === 'PrimaryMortgageStartDate') {
    //     let finalOriginationDates = formatDates(oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue)
    //     newOriginationDate = finalOriginationDates.formattedDate
    //     newMortgageObj.originationDate = newOriginationDate
    //     newMortgageObj.originationDateLabel = finalOriginationDates.formattedDateLabel
    //   } else if (req.body.recordField === 'PrimaryMortgageTerm') {
    //     newMortgageTerm = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    //     newMortgageObj.mortgageTerm = newMortgageTerm
    //   }
    //   if (newOriginationDate && newMortgageTerm) {
    //     let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)  
    //     newMortgageObj.timeframePresent = true
    //     newMortgageObj.endDate = newTimeframe.endDate
    //     newMortgageObj.endDateLabel = newTimeframe.endDateLabel
    //     newMortgageObj.remainingTerm = newTimeframe.remainingTerm
    //     newMortgageObj.originationDateLabel = newTimeframe.originationDateLabel
    //     newMortgageObj.monthsRemaining = newTimeframe.diffMonths
    //     newLeadObj.remainingMonths = newTimeframe.diffMonths
    //     if (newOriginalLoanAmount && newOriginalInterestRate) {
    //       if (leadId) {
    //         let oldLead = await ActiveLeadModel.findById(leadId).select('updates targetInterestRate')
    //         targetInterestRate = oldLead.targetInterestRate
    //       } else {
    //         let team = await TeamModel.findById(req.body.teamId).select('defaultTargetInterestRate')
    //         targetInterestRate = team.defaultTargetInterestRate
    //       }
    //       let newFinancials = await updateFinancials(
    //         newOriginalLoanAmount,
    //         newOriginalInterestRate,
    //         newMortgageTerm,
    //         targetInterestRate,
    //         newTimeframe.diffMonths,
    //         newOriginationDate,
    //       )
    //       newMortgageObj.financialsPresent = true
    //       newMortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
    //       newMortgageObj.monthlyPayments = newFinancials.monthlyPayments
    //       newMortgageObj.originalTotalDue = newFinancials.originalTotalDue
    //       newMortgageObj.originalInterestDue = newFinancials.originalInterestDue
    //       newMortgageObj.principalPaid = newFinancials.principalPaid
    //       newMortgageObj.interestPaid = newFinancials.interestPaid
    //       newMortgageObj.principalRemaining = newFinancials.principalRemaining
    //       newMortgageObj.interestRemaining = newFinancials.interestRemaining
    //       newMortgageObj.payments = newFinancials.payments
    //       newLeadObj.targetLoanAmount = newFinancials.principalRemaining
    //       newLeadObj.targetInterestDue = newFinancials.targetInterestDue
    //       newLeadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
    //       newLeadObj.targetProfitNumber = newFinancials.targetProfitNumber
    //       newLeadObj.targetProfitPercent = newFinancials.targetProfitPercent
    //     }
    //   }
    // } else {
    //   oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails timeline owner1 owner2')
    //   if (req.body.recordField === 'Owner1FullName') {
    //     newMortgageObj.owner1 = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    //     newMortgageObj.previousOwner1 = oldMortgage.owner1
    //   } else if (req.body.recordField === 'Owner2FullName') {
    //     newMortgageObj.owner2 = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    //     newMortgageObj.previousOwner2 = oldMortgage.owner2
    //   }
    // }
    let newDetails = oldMortgage.recordDetails
    let oldValue = oldMortgage.recordDetails[recordFieldRoot][recordField].currentValue
    let fieldLabel = oldMortgage.recordDetails[recordFieldRoot][recordField].label
    let assignedTier = oldMortgage.recordDetails[recordFieldRoot][recordField].assignedTier
    let originalValue = oldMortgage.recordDetails[recordFieldRoot][recordField].originalValue
    let newRemoveUndo = oldMortgage.recordDetails[recordFieldRoot][recordField].removeUndo
    let publicRecordValue = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    let originalDiscrepancy = oldMortgage.recordDetails[recordFieldRoot][recordField].originalDiscrepancy

    let newValue = publicRecordValue
    let newStatus = ''
    let newDiscrepancy = ''

    if (newValue === originalValue) {
      newStatus = 'inactive'
    } else {
      newStatus = 'edited'
    }

    if (originalValue === publicRecordValue) {
      newDiscrepancy = 'inactive'
    } else {
      newDiscrepancy = 'resolved'
    }

    if (!activeDiscrepancies) {
      activeDiscrepancies = 0
    }
    if (!resolvedDiscrepancies) {
      resolvedDiscrepancies = 0
    }
    if (!rejectedDiscrepancies) {
      rejectedDiscrepancies = 0
    }
    if (!newValue) {
      newValue = ''
    }
    if (!oldValue) {
      oldValue = ''
    }

    let newUpdate = {
      fieldRoot: recordFieldRoot,
      field: recordField,
      label: fieldLabel,
      old: oldValue,
      new: newValue,
      selection: selection,
      publicRecordValue: publicRecordValue,
    }

    if (oldDiscrepancy === 'active') {
      activeDiscrepancies--
    }
    if (originalDiscrepancy) {
      resolvedDiscrepancies++
    }

    let newTimelineGuid = nanoid()
    let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Resolved`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}

    newDetails[recordFieldRoot][recordField] = {
      discrepancy: newDiscrepancy,
      status: newStatus,
      label: fieldLabel,
      assignedTier: assignedTier,
      originalValue: originalValue,
      publicRecordValue: publicRecordValue,
      lastValue: oldValue,
      currentValue: newValue,
      removeUndo: newRemoveUndo,
      originalDiscrepancy: originalDiscrepancy,
      massEdit: false,
    }
    newMortgageObj.recordDetails = newDetails
    newMortgageObj.activeDiscrepancies = activeDiscrepancies
    newMortgageObj.resolvedDiscrepancies = resolvedDiscrepancies
    newMortgageObj.rejectedDiscrepancies = rejectedDiscrepancies
    newMortgageObj.$push = {timeline: timelineAddition}
    newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})

    if (leadId) {
      if (!oldLead._id) {
        oldLead = await ActiveLeadModel.findById(leadId).select('updates')
      }
      let oldUpdates = oldLead.updates
      let matchedUpdate = oldUpdates.find(update => update.field === recordField)
      if (!matchedUpdate && newValue !== originalValue) {
        oldUpdates.push({
          fieldRoot: recordFieldRoot,
          field: recordField,
          label: fieldLabel,
          originalValue: originalValue,
          old: oldValue,
          new: newValue,
          selection: selection,
          publicRecordValue: publicRecordValue,
        })
      } else if (matchedUpdate && newValue === originalValue) {
        let thisIndex = oldUpdates.indexOf(matchedUpdate)
        oldUpdates.splice(thisIndex, 1)
      } else if (matchedUpdate) {
        let newUpdate = {
          fieldRoot: recordFieldRoot,
          field: recordField,
          label: fieldLabel,
          originalValue: originalValue,
          old: oldValue,
          new: newValue,
          selection: selection,
          publicRecordValue: publicRecordValue,
        }
        let thisIndex = oldUpdates.indexOf(matchedUpdate)
        oldUpdates[thisIndex] = newUpdate
      }
      newLeadObj.updates = oldUpdates
      newLeadObj.$push = {timeline: timelineAddition}
      newLead = await ActiveLeadModel.findByIdAndUpdate((oldLead._id), newLeadObj, {new: true}).populate('belongsToMortgage')
      await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, leadId, newTimelineGuid, "lead", leadStatus)
    } else {
      await notifyAssignees(newMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "inactive")
    }

    let awaitingUpdate = null
    let awaitingVerification = null
    if (activeDiscrepancies === 0 && rejectedDiscrepancies === 0 && leadStatus === 'awaitingUpdate' && !req.body.closingLead) {
      let newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $inc: { leadsAwaitingUpdate: -1, leadsAwaitingVerification: 1 },
      }, {new: true})
      awaitingUpdate = newTeam.leadsAwaitingUpdate
      awaitingVerification = newTeam.leadsAwaitingVerification
    }

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Mortgage Details Updated', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id},{type: 'Field', detail: recordField},{type: 'Value', detail: newValue}], 'success', false, userFullName)
    sendApiSuccessResponse(res, {newLog, awaitingUpdate, awaitingVerification, newLead, leadStatus, newMortgage}, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Update Mortgage Details', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { resolveOne };