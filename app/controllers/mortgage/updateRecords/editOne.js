const moment = require('moment');
const TeamModel = require('../../../models/team');
const { nanoid } = require('nanoid')
const MortgageModel = require('../../../models/mortgage');
const ActiveLeadModel = require('../../../models/activeLead');
// const { formatDates } = require('../../../utils/formatDates.utils');
const { notifyAssignees } = require('../../../utils/notifyAssignees.utils');
// const { updateTimeframe } = require('../../../utils/mortgages/updateTimeframe.utils');
const { handleRequestLog } = require('../../../utils/logHandling.utils');
// const { updateFinancials } = require('../../../utils/mortgages/updateFinancials.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../../utils/response.utils');
//TODO: switch the populate(belongsToMortgage) to be able to grab mortgage info dynamically from FE

async function editOne(req, res) {
   try {
     console.info('-----------------------------------')
     console.info('-----------------------------------')
     console.info(`*** ${req.body.userFullName} is:`)
     console.info("*** Updating the mortgage's record details (editOne)")
     console.info(`mortgageID: ${req.body.mortgageId}`)
     let todaysDate = moment(new Date())
     console.info(`Time: ${todaysDate}`)

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateLabel = todaysDate.format('MMM Do, YYYY');
    let leadId = req.body.leadId
    let recordField = req.body.recordField
    let userFullName = req.body.userFullName
    let oldDiscrepancy = req.body.oldDiscrepancy
    let recordFieldRoot = req.body.recordFieldRoot
    let activeDiscrepancies = req.body.activeDiscrepancies
    let rejectedDiscrepancies = req.body.rejectedDiscrepancies
    let resolvedDiscrepancies = req.body.resolvedDiscrepancies
    let publicRecordValue = req.body.publicRecordValue
    let leadStatus = req.body.leadStatus
    let reqOrigin = req.body.origin
    let newValue = ''
    if (req.body.dateFormat) {
      if (req.body.dateFormat === 'MMM Do, yyyy') {
        let thisDate = moment(new Date(req.body.customValue))
        newValue = thisDate.format('MMM Do, YYYY')
      } else {
        let thisDate = moment(new Date(req.body.customValue))
        newValue = thisDate.format('yyyy-MM-DD')
      }
    } else {
      if (typeof req.body.customValue !== 'number') {
        newValue = req.body.customValue.toUpperCase().trim()
      } else {
        newValue = req.body.customValue
      }
    }
    let activeAdded = false
    let activeRemoved = false
    let resolvedAdded = false
    let resolvedRemoved = false
    let rejectedAdded = false
    let rejectedRemoved = false
    let newTeam = {}
    let oldLead = {}
    let newLead = {}
    let createLead = {}
    let newLeadObj = {}
    let newMortgage = {}
    // let oldMortgage = {}
    let newMortgageObj = {}
    let targetInterestRate = 0
    let targetLoanTerm = 0
    if (leadId) {
      let oldLead = await ActiveLeadModel.findById(leadId).select('updates targetInterestRate targetLoanTerm')
      targetInterestRate = oldLead.targetInterestRate
      targetLoanTerm = oldLead.targetLoanTerm
    } else {
      newTeam = await TeamModel.findById(req.body.teamId).select('defaultTargetInterestRate defaultTargetTerm')
      targetInterestRate = newTeam.defaultTargetInterestRate
      targetLoanTerm = newTeam.defaultTargetTerm
    }
    // if (req.body.financialsUpdated) {
    //   oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails owner1 owner2 timeline originalLoanAmount originalInterestRate originationDate mortgageTerm')
    //   let newMortgageTerm = oldMortgage.mortgageTerm
    //   let newOriginationDate = oldMortgage.originationDate
    //   let newOriginalLoanAmount = oldMortgage.originalLoanAmount
    //   let newOriginalInterestRate = oldMortgage.originalInterestRate
    //   if (req.body.recordField === 'PrimaryMortgageAmount') {
    //     newValue = newValue
    //     newOriginalLoanAmount = newValue
    //     if (reqOrigin !== 'awaitingUpdate') {
    //       newMortgageObj.originalLoanAmount = newOriginalLoanAmount
    //     }
    //   } else if (req.body.recordField === 'PrimaryMortgageInterestRate') {
    //     newOriginalInterestRate = newValue
    //     if (reqOrigin !== 'awaitingUpdate') {
    //       newMortgageObj.originalInterestRate = newOriginalInterestRate
    //     }
    //   } else if (req.body.recordField === 'PrimaryMortgageStartDate') {
    //     let finalOriginationDates = formatDates(oldMortgage.originationDate)
    //     newOriginationDate = finalOriginationDates.formattedDate
    //     if (reqOrigin !== 'awaitingUpdate') {
    //       newMortgageObj.originationDate = newOriginationDate
    //     }
    //     newMortgageObj.originationDateLabel = finalOriginationDates.formattedDateLabel
    //   } else if (req.body.recordField === 'PrimaryMortgageTerm') {
    //     newMortgageTerm = newValue
    //     if (reqOrigin !== 'awaitingUpdate') {
    //       newMortgageObj.mortgageTerm = newMortgageTerm
    //     }
    //   }

    //   if (newOriginationDate && newMortgageTerm) {
    //     let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)  
    //     newMortgageObj.timeframePresent = true
    //     if (reqOrigin !== 'awaitingUpdate') {
    //       newMortgageObj.endDate = newTimeframe.endDate
    //       newMortgageObj.endDateLabel = newTimeframe.endDateLabel
    //       newMortgageObj.remainingTerm = newTimeframe.remainingTerm
    //       newMortgageObj.originationDateLabel = newTimeframe.originationDateLabel
    //       newMortgageObj.monthsRemaining = newTimeframe.diffMonths
    //     }
    //     newLeadObj.remainingMonths = newTimeframe.diffMonths
    //     if (!targetInterestRate) {
    //       newTeam = await TeamModel.findById(req.body.teamId).select('defaultTargetInterestRate defaultTargetTerm')
    //       targetInterestRate = newTeam.defaultTargetInterestRate
    //     }
    //     if (newOriginalLoanAmount && newOriginalInterestRate) {
    //       let newFinancials = await updateFinancials(
    //         newOriginalLoanAmount,
    //         newOriginalInterestRate,
    //         newMortgageTerm,
    //         targetInterestRate,
    //         newTimeframe.diffMonths,
    //         newOriginationDate,
    //       )
    //       newMortgageObj.financialsPresent = true
    //       if (reqOrigin !== 'awaitingUpdate') {
    //         newMortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
    //         newMortgageObj.monthlyPayments = newFinancials.monthlyPayments
    //         newMortgageObj.originalTotalDue = newFinancials.originalTotalDue
    //         newMortgageObj.originalInterestDue = newFinancials.originalInterestDue
    //         newMortgageObj.principalPaid = newFinancials.principalPaid
    //         newMortgageObj.interestPaid = newFinancials.interestPaid
    //         newMortgageObj.principalRemaining = newFinancials.principalRemaining
    //         newMortgageObj.interestRemaining = newFinancials.interestRemaining
    //         newMortgageObj.payments = newFinancials.payments
    //       }
    //       newLeadObj.targetLoanAmount = newFinancials.principalRemaining
    //       newLeadObj.targetInterestDue = newFinancials.targetInterestDue
    //       newLeadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
    //       newLeadObj.targetProfitNumber = newFinancials.targetProfitNumber
    //       newLeadObj.targetProfitPercent = newFinancials.targetProfitPercent
    //     }
    //   }
    // } else {
    let oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails timeline reports')
      // if (req.body.recordField === 'Owner1FullName') {
      //   newMortgageObj.owner1 = newValue
      //   newMortgageObj.previousOwner1 = oldMortgage.owner1
      // } else if (req.body.recordField === 'Owner2FullName') {
      //   newMortgageObj.owner2 = newValue
      //   newMortgageObj.previousOwner2 = oldMortgage.owner2
      // }
    // }

    let newDetails = oldMortgage.recordDetails
    let oldValue = oldMortgage.recordDetails[recordFieldRoot][recordField].currentValue
    let fieldLabel = oldMortgage.recordDetails[recordFieldRoot][recordField].label
    let assignedTier = oldMortgage.recordDetails[recordFieldRoot][recordField].assignedTier
    let originalValue = oldMortgage.recordDetails[recordFieldRoot][recordField].originalValue
    let newRemoveUndo = oldMortgage.recordDetails[recordFieldRoot][recordField].removeUndo
    let originalDiscrepancy = oldMortgage.recordDetails[recordFieldRoot][recordField].originalDiscrepancy
    let oldMassEdit = oldMortgage.recordDetails[recordFieldRoot][recordField].massEdit

    let leadCreated = false
    let leadExisting = false
    let newTimelineGuid = nanoid()
    let timelineAddition = {}
    let newStatus = ''
    let newDiscrepancy = ''
    //* newValue shouldn't equal publicRecordValue.
    if (newValue === publicRecordValue) {
      if (newValue === originalValue) {
        newStatus = 'inactive'
      } else {
        newStatus = 'edited'
      }
      newRemoveUndo = false
    } else {
      if (originalDiscrepancy && newValue === originalValue) {
        if (req.body.selection === 'keep') {
          newStatus = 'edited'
        } else {
          newStatus = 'discrepancy'
        }
      } else {
        newStatus = 'edited'
      }
      newRemoveUndo = false
    }
    //* newValue shouldn't equal publicRecordValue.
    if (newValue === publicRecordValue) {
      if (originalValue === publicRecordValue) {
        newDiscrepancy = 'inactive'
      } else {
        newDiscrepancy = 'resolved'
      }
    } else {
      if (newStatus !== 'edited') {
        if (req.body.selection === 'keep') {
          newDiscrepancy = 'rejected'
        } else {
          newDiscrepancy = 'active'
        }
      } else {
        if (!publicRecordValue || (publicRecordValue && publicRecordValue.length === 0)) {
          newDiscrepancy = 'provided'
        } else {
          newDiscrepancy = 'rejected'
        }
      }
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
      selection: 'custom',
      publicRecordValue: publicRecordValue,
    }
    if (!leadId && (publicRecordValue.length > 0 || publicRecordValue > 0)) {
      rejectedDiscrepancies++
      rejectedAdded = true
      timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: "Internal Records Updated", details: newUpdate, notify: false}
    } else if (publicRecordValue && (publicRecordValue.length > 0 || publicRecordValue > 0)) {
      if (newValue === publicRecordValue) {
        if (oldDiscrepancy === 'rejected') {
          rejectedDiscrepancies--
          rejectedRemoved = true
        } else if (oldDiscrepancy === 'active') {
          activeDiscrepancies--
          activeRemoved = true
        }
        if (originalDiscrepancy) {
          resolvedDiscrepancies++
          resolvedAdded = true
        }
        timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Edited`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
      } else {
        if (oldDiscrepancy === 'resolved') {
          if (newValue === originalValue) {
            activeDiscrepancies++
            activeAdded = true
          } else {
            rejectedDiscrepancies++
            rejectedAdded = true
          }
          resolvedDiscrepancies--     
          resolvedRemoved = true       
          timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Confirmed`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
        } else if (oldDiscrepancy === 'inactive') {
          rejectedDiscrepancies++
          rejectedAdded = true
          timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Created`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
        } else if (oldDiscrepancy === 'active') {
          activeDiscrepancies--
          activeRemoved = true
          rejectedDiscrepancies++
          rejectedAdded = true
          timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Confirmed`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
        }
        if (oldDiscrepancy === 'rejected') {
          if (newValue === originalValue) {
            activeDiscrepancies++
            activeAdded = true
            rejectedDiscrepancies--
            rejectedRemoved = true
            timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Confirmed`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
          } else if (newValue === publicRecordValue) {
            rejectedDiscrepancies--
            rejectedRemoved = true
            resolvedDiscrepancies++
            resolvedAdded = true
            timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Resolved`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
          } else {
            timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Edited`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
          }
        }
      }
    } else {
      if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
        timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Record Provided`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
      }
    }
 
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
      timelineGuid: newTimelineGuid,
    }

    if (leadId) {
      leadExisting = true
      if (!oldLead._id) {
        oldLead = await ActiveLeadModel.findById(leadId).select('updates')
      }
      let oldUpdates = oldLead.updates
      let matchedUpdate = oldUpdates.find(update => update.field === recordField)
      let newSelection = 'custom'
      if (req.body.selection === 'keep') {
        newSelection = 'keep'
      }
      if (!matchedUpdate && newValue !== originalValue) {
        oldUpdates.push({
          fieldRoot: recordFieldRoot,
          field: recordField,
          label: fieldLabel,
          originalValue: originalValue,
          old: oldValue,
          new: newValue,
          selection: newSelection,
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
          selection: newSelection,
          publicRecordValue: publicRecordValue,
        }
        let thisIndex = oldUpdates.indexOf(matchedUpdate)
        oldUpdates[thisIndex] = newUpdate
      }
      if (!newRemoveUndo || oldMassEdit) {
        newLeadObj.updates = oldUpdates
        if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
          newLeadObj.$push = {timeline: timelineAddition}
        }
      }
    } else if ((publicRecordValue && (publicRecordValue.length > 0 || publicRecordValue > 0)) && reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
      leadCreated = true
      newLeadObj.tags = []
      newLeadObj.tagIds = []
      newLeadObj.dateCreated = logTime
      newLeadObj.belongsToTeam = req.body.teamId
      newLeadObj.belongsToMortgage = req.body.mortgageId
      newLeadObj.status = 'awaitingUpdate'
      newLeadObj.publicRecordsUpdated = false
      newLeadObj.awaitingUpdates = true
      newLeadObj.tier = 5
      newLeadObj.dateDiscovered = todaysDateLabel
      newLeadObj.dateDiscoveredLabel = todaysDateLabel
      newLeadObj.targetLoanTerm = targetLoanTerm
      newLeadObj.targetInterestRate = targetInterestRate
      if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
        newLeadObj.timeline = [timelineAddition]
      }
      newLeadObj.reports = oldMortgage.reports
      newLeadObj.targetOutcome = 'renegotiation'
      newLeadObj.updates = [{
        fieldRoot: recordFieldRoot,
        field: recordField,
        label: fieldLabel,
        originalValue: originalValue,
        old: oldValue,
        new: newValue,
        selection: 'custom',
        publicRecordValue: publicRecordValue,
      }]
      createLead = new ActiveLeadModel(newLeadObj)
      await createLead.save()
      newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $inc: { leadsAwaitingUpdate: 1 },
        $push: { awaitingUpdateLeads: createLead._id },
      }, {new: true})
    }

    newMortgageObj.recordDetails = newDetails
    newMortgageObj.activeDiscrepancies = activeDiscrepancies
    newMortgageObj.resolvedDiscrepancies = resolvedDiscrepancies
    newMortgageObj.rejectedDiscrepancies = rejectedDiscrepancies
    if (leadCreated) {
      newMortgageObj.status = 'awaitingUpdate'
      newMortgageObj.activeLead = createLead._id
      newMortgageObj.activeLeadTier = 5
      newMortgageObj.awaitingUpdates = true
      if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
        newMortgageObj.$push = { timeline: timelineAddition }
      }
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})
    } else if (!newRemoveUndo || oldMassEdit) {
      if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
        newMortgageObj.$push = { timeline: timelineAddition }
      }
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})
    } else {
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})
    }

    if (leadId) {
      newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), newLeadObj, {new: true}).populate('belongsToMortgage')
    } else if (leadCreated) {
      newLead = await ActiveLeadModel.findById(createLead._id).populate('belongsToMortgage')
      leadId = newLead._id
    }

    if (reqOrigin !== 'provideFinancials' && reqOrigin !== 'finalizeLead' && reqOrigin !== 'awaitingUpdate') {
      if (leadId) {
        await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, leadId, newTimelineGuid, "lead", leadStatus)
      } else {
        await notifyAssignees(newMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "inactive")
      }
    }

    let awaitingUpdate = null
    let awaitingVerification = null
    // if ((activeDiscrepancies === 1 && activeAdded) && (rejectedDiscrepancies === 0 && !rejectedRemoved) && leadStatus === 'awaitingUpdate') {
    //   newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
    //     $inc: { leadsAwaitingUpdate: 1, leadsAwaitingVerification: -1 },
    //   }, {new: true})
    //   awaitingUpdate = newTeam.leadsAwaitingUpdate
    //   awaitingVerification = newTeam.leadsAwaitingVerification
    // } else if ((activeDiscrepancies === 0 && !activeRemoved) && (rejectedDiscrepancies === 1 && rejectedAdded) && leadStatus === 'awaitingUpdate') {
    //   newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
    //     $inc: { leadsAwaitingUpdate: 1, leadsAwaitingVerification: -1 },
    //   }, {new: true})
    //   awaitingUpdate = newTeam.leadsAwaitingUpdate
    //   awaitingVerification = newTeam.leadsAwaitingVerification
    // } else if (activeDiscrepancies === 0 && rejectedDiscrepancies === 0 && leadStatus === 'awaitingUpdate') {
    //   newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
    //     $inc: { leadsAwaitingUpdate: -1, leadsAwaitingVerification: 1 },
    //   }, {new: true})
    //   awaitingUpdate = newTeam.leadsAwaitingUpdate
    //   awaitingVerification = newTeam.leadsAwaitingVerification
    // }

   let newLog = await handleRequestLog('Log', logTime, 'Mortgage Details Updated', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id},{type: 'Field', detail: recordField},{type: 'Value', detail: newValue}], 'success', false, userFullName)
   sendApiSuccessResponse(res, {activeAdded, activeRemoved, rejectedAdded, rejectedRemoved, resolvedAdded, resolvedRemoved, reqOrigin, awaitingUpdate, awaitingVerification, newTeam, newLog, newLead, leadStatus, newMortgage, leadCreated, leadExisting}, 'update successful');
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
 
 module.exports = { editOne };