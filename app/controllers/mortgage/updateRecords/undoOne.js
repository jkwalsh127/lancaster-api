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

async function undoOne(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Updating the mortgage's record details (undoOne)")
    console.info(`mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let todaysDateLabel = todaysDate.format('MMM Do, YYYY')
    let leadId = req.body.leadId
    let teamId = req.body.teamId
    let recordField = req.body.recordField
    let userFullName = req.body.userFullName
    let oldDiscrepancy = req.body.oldDiscrepancy
    let recordFieldRoot = req.body.recordFieldRoot
    let activeDiscrepancies = req.body.activeDiscrepancies
    let rejectedDiscrepancies = req.body.rejectedDiscrepancies
    let resolvedDiscrepancies = req.body.resolvedDiscrepancies
    let discardLead = req.body.discardLead
    let leadStatus = req.body.leadStatus
    let rejectedRemoved = false
    let activeRemoved = false
    let rejectedAdded = false
    let activeAdded = false
    let oldLead = {}
    let newLead = {}
    let newTeam = {}
    let newLeadObj = {}
    let newMortgage = {}
    // let oldMortgage = {}
    let newMortgageObj = {}
    // if (req.body.financialsUpdated) {
    //   oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails timeline originalLoanAmount originalInterestRate originationDate mortgageTerm')
    //   let newMortgageTerm = oldMortgage.mortgageTerm
    //   let newOriginationDate = oldMortgage.originationDate
    //   let newOriginalLoanAmount = oldMortgage.originalLoanAmount
    //   let newOriginalInterestRate = oldMortgage.originalInterestRate
    //   if (req.body.recordField === 'PrimaryMortgageAmount') {
    //     newOriginalLoanAmount = oldMortgage.recordDetails[recordFieldRoot][recordField].lastValue
    //     newMortgageObj.originalLoanAmount = newOriginalLoanAmount
    //   } else if (req.body.recordField === 'PrimaryMortgageInterestRate') {
    //     newOriginalInterestRate = oldMortgage.recordDetails[recordFieldRoot][recordField].lastValue
    //     newMortgageObj.originalInterestRate = newOriginalInterestRate
    //   } else if (req.body.recordField === 'PrimaryMortgageStartDate') {
    //     let finalOriginationDates = formatDates(oldMortgage.recordDetails[recordFieldRoot][recordField].lastValue)
    //     newOriginationDate = finalOriginationDates.formattedDate
    //     newMortgageObj.originationDate = newOriginationDate
    //     newMortgageObj.originationDateLabel = finalOriginationDates.formattedDateLabel
    //   } else if (req.body.recordField === 'PrimaryMortgageTerm') {
    //     newMortgageTerm = oldMortgage.recordDetails[recordFieldRoot][recordField].lastValue
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
    let oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails timeline')
    //   if (req.body.recordField === 'Owner1FullName') {
    //     newMortgageObj.owner1 = newValue
    //     newMortgageObj.previousOwner1 = null
    //   } else if (req.body.recordField === 'Owner2FullName') {
    //     newMortgageObj.owner2 = newValue
    //     newMortgageObj.previousOwner2 = null
    //   }
    // }
    let newDetails = oldMortgage.recordDetails
    let oldMortgageTimeline = oldMortgage.timeline
    let oldValue = oldMortgage.recordDetails[recordFieldRoot][recordField].currentValue
    let lastValue = oldMortgage.recordDetails[recordFieldRoot][recordField].lastValue
    let fieldLabel = oldMortgage.recordDetails[recordFieldRoot][recordField].label
    let assignedTier = oldMortgage.recordDetails[recordFieldRoot][recordField].assignedTier
    let timelineGuid = oldMortgage.recordDetails[recordFieldRoot][recordField].timelineGuid
    let oldRemoveUndo = oldMortgage.recordDetails[recordFieldRoot][recordField].removeUndo
    let originalValue = oldMortgage.recordDetails[recordFieldRoot][recordField].originalValue
    let newRemoveUndo = oldMortgage.recordDetails[recordFieldRoot][recordField].removeUndo
    let publicRecordValue = oldMortgage.recordDetails[recordFieldRoot][recordField].publicRecordValue
    let originalDiscrepancy = oldMortgage.recordDetails[recordFieldRoot][recordField].originalDiscrepancy
    let oldMassEdit = oldMortgage.recordDetails[recordFieldRoot][recordField].massEdit
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")

    let timelineAddition = {}
    let newTimelineGuid = nanoid()
    let newValue = lastValue
    let newStatus = ''
    let newDiscrepancy = ''

    if (newValue === publicRecordValue) {
      if (newValue === originalValue) {
        newStatus = 'inactive'
      } else {
        newStatus = 'edited'
      }
      if (!oldRemoveUndo) {
        newRemoveUndo = true
      } else {
        newRemoveUndo = false
      }
    } else {
      if (originalDiscrepancy && newValue === originalValue) {
        newStatus = 'discrepancy'
      } else {
        newStatus = 'edited'
      }
      if (!oldRemoveUndo) {
        newRemoveUndo = true
      } else {
        newRemoveUndo = false
      }
    }
    if (newValue === publicRecordValue) {
      if (originalValue === publicRecordValue) {
        newDiscrepancy = 'inactive'
      } else {
        newDiscrepancy = 'resolved'
      }
    } else {
      if (newStatus !== 'edited' && newStatus !== 'provided') {
        newDiscrepancy = 'active'
      } else {
        newDiscrepancy = 'rejected'
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
      selection: 'undo',
      publicRecordValue: publicRecordValue,
    }
    if (publicRecordValue) {
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
        }
        timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Resolved`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
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
            timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Resolved`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
          } else {
            timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: `"${fieldLabel}" Discrepancy Edited`, details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
          }
        }
      }
    } else {
      timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: userFullName, milestone: 'Mortgage Updated', details: newUpdate, notify: false, activeDiscrepancies: activeDiscrepancies+rejectedDiscrepancies}
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
    }

    let oldUpdates = []
    let oldLeadTimeline = []
    if (leadId) {
      if (!oldLead._id) {
        oldLead = await ActiveLeadModel.findById(leadId).select('updates timeline')
      }
      oldUpdates = oldLead.updates
      oldLeadTimeline = oldLead.timeline
      let matchedUpdate = oldUpdates.find(update => update.field === recordField)
      if (!matchedUpdate && newValue !== originalValue) {
        oldUpdates.push({
          fieldRoot: recordFieldRoot,
          field: recordField,
          label: fieldLabel,
          originalValue: originalValue,
          old: oldValue,
          new: newValue,
          selection: 'undo',
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
          selection: 'undo',
          publicRecordValue: publicRecordValue,
        }
        let thisIndex = oldUpdates.indexOf(matchedUpdate)
        oldUpdates[thisIndex] = newUpdate
      }
    }

    if (!oldMassEdit) {
      let targetMilestoneLead = null
      if (leadId) {
        if (discardLead) {
          oldLead = await ActiveLeadModel.findById(leadId)
          let newDeleteLeadObj = oldLead
          newDeleteLeadObj.dateDeleted = logTime
          newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), newDeleteLeadObj, {new: true}).populate('belongsToMortgage')
        } else {
          for (let i = (oldLeadTimeline.length - 1); i >= 0; i--) {
            if (oldLeadTimeline[i].guid === timelineGuid) {
                targetMilestoneLead = oldLeadTimeline[i]
                break
            }
          }
          let targetIndexLead = null
          if (targetMilestoneLead) {
            targetIndexLead = oldLeadTimeline.indexOf(targetMilestoneLead)
            oldLeadTimeline.splice(targetIndexLead, 1)
          }
          newLeadObj.updates = oldUpdates
          newLeadObj.timeline = oldLeadTimeline
        }
      }

      let targetMilestoneMortgage = null
      for (let i = (oldMortgageTimeline.length - 1); i >= 0; i--) {
        if (oldMortgageTimeline[i].guid === timelineGuid) {
          targetMilestoneMortgage = oldMortgageTimeline[i]
          break
        }
      }
      let targetIndexMortgage = null
      if (targetMilestoneMortgage) {
        targetIndexMortgage = oldMortgageTimeline.indexOf(targetMilestoneMortgage)
        oldMortgageTimeline.splice(targetIndexMortgage, 1)
      }
      if (discardLead) {
        newMortgageObj.recordDetails = newDetails
        newMortgageObj.activeDiscrepancies = activeDiscrepancies
        newMortgageObj.resolvedDiscrepancies = resolvedDiscrepancies
        newMortgageObj.rejectedDiscrepancies = rejectedDiscrepancies
        newMortgageObj.status = 'inactive'
        newMortgageObj.activeLead = null
        newMortgageObj.activeLeadTier = null
        newMortgageObj.awaitingUpdates = false
        newMortgageObj.timeline = oldMortgageTimeline
        newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})
        newTeam = await TeamModel.findByIdAndUpdate((teamId), {
          $inc: { leadsAwaitingUpdate: -1 },
          $pull: { awaitingUpdateLeads: leadId }
        })
      } else {
        newMortgageObj.recordDetails = newDetails
        newMortgageObj.activeDiscrepancies = activeDiscrepancies
        newMortgageObj.resolvedDiscrepancies = resolvedDiscrepancies
        newMortgageObj.rejectedDiscrepancies = rejectedDiscrepancies
        newMortgageObj.timeline = oldMortgageTimeline
        newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {
          recordDetails: newDetails,
          resolvedDiscrepancies: resolvedDiscrepancies,
          rejectedDiscrepancies: rejectedDiscrepancies,
          timeline: oldMortgageTimeline,
          activeDiscrepancies: activeDiscrepancies,
        }, {new: true})
      }
    } else {
      if (leadId) {
        newLeadObj.updates = oldUpdates
        newLeadObj.$push = {timeline: timelineAddition}
      }
      newMortgageObj.recordDetails = newDetails
      newMortgageObj.activeDiscrepancies = activeDiscrepancies
      newMortgageObj.resolvedDiscrepancies = resolvedDiscrepancies
      newMortgageObj.rejectedDiscrepancies = rejectedDiscrepancies
      newMortgageObj.$push = {timeline: timelineAddition}
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), newMortgageObj, {new: true})
    }

    if (!oldMassEdit && leadId) {
      newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), newLeadObj, {new: true}).populate('belongsToMortgage')
    } else if (leadId) {
      newLead = await ActiveLeadModel.findByIdAndUpdate((oldLead._id), newLeadObj, {new: true}).populate('belongsToMortgage')
    }
         
    if (leadId) {
      await notifyAssignees(newLead.assigneeIds, req.body.userId, req.body.mortgageId, leadId, newTimelineGuid, "lead", leadStatus)
    } else {
      await notifyAssignees(newMortgage.assigneeIds, req.body.userId, req.body.mortgageId, null, newTimelineGuid, "mortgage", "inactive")
    }

    let awaitingUpdate = null
    let awaitingVerification = null
    if ((activeDiscrepancies === 1 && activeAdded) && (rejectedDiscrepancies === 0 && !rejectedRemoved) && leadStatus === 'awaitingUpdate') {
      newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $inc: { leadsAwaitingUpdate: 1, leadsAwaitingVerification: -1 },
      }, {new: true})
      awaitingUpdate = newTeam.leadsAwaitingUpdate
      awaitingVerification = newTeam.leadsAwaitingVerification
    } else if ((activeDiscrepancies === 0 && !activeRemoved) && (rejectedDiscrepancies === 1 && rejectedAdded) && leadStatus === 'awaitingUpdate') {
      newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $inc: { leadsAwaitingUpdate: 1, leadsAwaitingVerification: -1 },
      }, {new: true})
      awaitingUpdate = newTeam.leadsAwaitingUpdate
      awaitingVerification = newTeam.leadsAwaitingVerification
    } else if (activeDiscrepancies === 0 && rejectedDiscrepancies === 0 && leadStatus === 'awaitingUpdate') {
      newTeam = await TeamModel.findByIdAndUpdate((req.body.teamId), {
        $inc: { leadsAwaitingUpdate: -1, leadsAwaitingVerification: 1 },
      }, {new: true})
      awaitingUpdate = newTeam.leadsAwaitingUpdate
      awaitingVerification = newTeam.leadsAwaitingVerification
    }
 
     let newLog = await handleRequestLog('Log', logTime, 'Mortgage Details Updated', 'Mortgage', [{type: 'Mortgage ID', detail: newMortgage._id},{type: 'Field', detail: recordField},{type: 'Value', detail: newValue}], 'success', false, userFullName)
     sendApiSuccessResponse(res, {awaitingUpdate, awaitingVerification, newLog, newLead, leadStatus, newMortgage, discardLead}, 'update successful');
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
 
module.exports = { undoOne }