const moment = require('moment');
const TeamModel = require('../../../models/team');
const UserModel = require('../../../models/user');
const { nanoid } = require('nanoid');
const ReportModel = require('../../../models/report');
const MortgageModel = require('../../../models/mortgage');
const ActiveLeadModel = require('../../../models/activeLead');
const { notifyAssignees } = require('../../../utils/notifyAssignees.utils');
// const { updateTimeframe } = require('../../../utils/mortgages/updateTimeframe.utils');
const { handleRequestLog } = require('../../../utils/logHandling.utils');
// const { updateFinancials } = require('../../../utils/mortgages/updateFinancials.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../../utils/response.utils');

async function resolveAllDiscrepancies(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Resolving all discrepancies for the lead")
    console.info(`*** mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let newLeads = []
    let newReport = {}
    let leadStatus = null
    let mortgageIds = []
    let newMortgages = []
    let updateReport = false
    let awaitingUpdateDec = false
    let activeDiscrepancies = 0
    let rejectedDiscrepancies = 0
    let resolvedDiscrepancies = 0
    let awaitingVerificationInc = false
    let teamId = req.body.teamId
    let mission = req.body.mission
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateLabel = todaysDate.format('MMM Do, YYYY')
    if (mission === 'stillInvestigating' || mission === 'awaitingUpdate' || mission === 'finalizeLead' || mission === 'dismissInvestigation') {
      mortgageIds.push(req.body.mortgageId)
    } else {
      let teamMortgages = await TeamModel.findById(teamId).select('mortgages')
      mortgageIds = [...teamMortgages]
    }
    for (let i = 0; i < mortgageIds.length; i++) {
      let mortgage = await MortgageModel.findById(mortgageIds[i]).select('recordDetails activeLead activeDiscrepancies rejectedDiscrepancies resolvedDiscrepancies')
      activeDiscrepancies = mortgage.activeDiscrepancies
      rejectedDiscrepancies = mortgage.rejectedDiscrepancies
      resolvedDiscrepancies = mortgage.resolvedDiscrepancies
      // let owner1 = mortgage.owner1
      // let previousOwner1 = mortgage.previousOwner1
      // let owner2 = mortgage.owner2
      // let previousOwner2 = mortgage.previousOwner2
      // let newOriginalLoanAmount = mortgage.originalLoanAmount
      // let newOriginalInterestRate = mortgage.originalInterestRate
      // let newOriginationDate = mortgage.originationDate
      // let newMortgageTerm = mortgage.mortgageTerm
      let ownerUpdated = false
      let detailsUpdated = false
      // let financialsUpdated = false
      let newRecordDetails = mortgage.recordDetails
      let mortgageRecordDetails = mortgage.recordDetails
      let activeLead = await ActiveLeadModel.findById(mortgage.activeLead).select('updates status awaitingUpdates targetInterestRate')
      let allLeadUpdates = activeLead.updates
      let newUpdates = []
      for (let j = 0; j < Object.entries(mortgageRecordDetails).length; j++) {
        for (let k = 0; k < Object.entries(Object.entries(mortgageRecordDetails)[j][1]).length; k++) {
          if (Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].discrepancy === 'active' || Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].discrepancy === 'rejected') {
            detailsUpdated = true
            let matchedUpdate = allLeadUpdates.find(update => update.field === Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][0])
            let newUpdate = {
              fieldRoot: Object.entries(mortgageRecordDetails)[j][0],
              field: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][0],
              label: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].label,
              originalValue:  Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].originalValue,
              old: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].currentValue,
              new: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue,
              selection: 'macth',
              publicRecordValue: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue,
            }
            if (!matchedUpdate) {
              newUpdates.push(newUpdate)
              allLeadUpdates.push(newUpdate)
            } else {
              let thisIndex = allLeadUpdates.indexOf(matchedUpdate)
              allLeadUpdates[thisIndex] = newUpdate
              newUpdates.push(newUpdate)
            }
            if (Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].discrepancy === 'active') {
              resolvedDiscrepancies++
              activeDiscrepancies--
            } else {
              resolvedDiscrepancies++
              rejectedDiscrepancies--
            }
            let discrepancyDesignation = 'resolved'
            let statusDesignation = 'edited'
            if (mission === 'dismissInvestigation' || mission === 'awaitingUpdate' || mission === 'finalizeLead') {
              discrepancyDesignation = 'inactive'
              statusDesignation = 'inactive'
            }
            newRecordDetails[Object.entries(mortgageRecordDetails)[j][0]][Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][0]] = {
              discrepancy: discrepancyDesignation,
              status: statusDesignation,
              label: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].label,
              assignedTier: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].assignedTier,
              originalValue: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].originalValue,
              publicRecordValue: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue,
              lastValue: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].currentValue,
              currentValue: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue,
              massEdit: true,
              removeUndo: true,
              originalDiscrepancy: Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].originalDiscrepancy,
            }
            // if (Object.entries(mortgageRecordDetails)[j][0] === 'Owner1FullName') {
            //   ownerUpdated = true
            //   owner1 = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
            //   previousOwner1 = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].currentValue
            // } else if (Object.entries(mortgageRecordDetails)[j][0] === 'Owner2FullName') {
            //   ownerUpdated = true
            //   owner2 = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
            //   previousOwner2 = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].currentValue
            // } else if (Object.entries(mortgageRecordDetails)[j][0] === 'PrimaryMortgageAmount') {
              // financialsUpdated = true
              // if (mission !== 'awaitingUpdate') {
                // newOriginalLoanAmount = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
              // }
            // } else if (Object.entries(mortgageRecordDetails)[j][0] === 'PrimaryMortgageInterestRate') {
              // financialsUpdated = true
              // if (mission !== 'awaitingUpdate') {
                // newOriginalInterestRate = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
              // }
            // } else if (Object.entries(mortgageRecordDetails)[j][0] === 'PrimaryMortgageStartDate') {
              // financialsUpdated = true
              // if (mission !== 'awaitingUpdate') {
                // newOriginationDate = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
              // }
            // } else if (Object.entries(mortgageRecordDetails)[j][0] === 'PrimaryMortgageTerm') {
              // financialsUpdated = true
              // if (mission !== 'awaitingUpdate') {
                // newMortgageTerm = Object.entries(Object.entries(mortgageRecordDetails)[j][1])[k][1].publicRecordValue
              // }
            // }
          }
        }
      }
      let newTimelineGuid = nanoid()
      let timelineAddition = {guid: newTimelineGuid, date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'All Discrepancies Resolved', details: newUpdates, notify: false}
      if (mission === 'awaitingUpdate' || mission === 'finalizeLead' || mission === 'dismissInvestigation') {
        activeDiscrepancies = 0
        rejectedDiscrepancies = 0
        resolvedDiscrepancies = 0
        updateReport = true
        let oldReport = await ReportModel.findOne({belongsToLead: activeLead._id}).select('timeline')
        if (oldReport) {
          let oldTimeline = oldReport.timeline
          let thisMilestone = oldTimeline.find(milestone => milestone.milestone.includes('Finalized'))
          if (thisMilestone) {
            thisMilestone.awaitingUpdate = false
            oldTimeline.push(timelineAddition)
            newReport = await ReportModel.findByIdAndUpdate((oldReport._id), {timeline: oldTimeline}, {new: true})
          } else {
            newReport = oldReport
          }
        } else {
          updateReport = false
        }
      }
      if (detailsUpdated) {
        let mortgageObj = {
          activeDiscrepancies: activeDiscrepancies,
          rejectedDiscrepancies: rejectedDiscrepancies,
          resolvedDiscrepancies: resolvedDiscrepancies,
          awaitingUpdates: false,
          recordDetails: newRecordDetails,
          // originalLoanAmount: newOriginalLoanAmount,
          // originalInterestRate: newOriginalInterestRate,
          // originationDate: newOriginationDate,
          // mortgageTerm: newMortgageTerm,
          $push: { 
            timeline: {
              $each: [ timelineAddition ],
            },
          },
        }
        // if (financialsUpdated) {
        //   if (newOriginationDate && newMortgageTerm) {
        //     let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)  
        //     mortgageObj.timeframePresent = true
        //     if (mission !== 'awaitingUpdate') {
        //       mortgageObj.endDate = newTimeframe.endDate
        //       mortgageObj.endDateLabel = newTimeframe.endDateLabel
        //       mortgageObj.remainingTerm = newTimeframe.remainingTerm
        //       mortgageObj.originationDateLabel = newTimeframe.originationDateLabel
        //       mortgageObj.monthsRemaining = newTimeframe.diffMonths
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
        //       mortgageObj.financialsPresent = true
        //       if (mission !== 'awaitingUpdate') {
        //         mortgageObj.mortgageTerm = newMortgageTerm
        //         mortgageObj.originationDate = newOriginationDate
        //         mortgageObj.originalInterestRate = newOriginalInterestRate
        //         mortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
        //         mortgageObj.monthlyPayments = newFinancials.monthlyPayments
        //         mortgageObj.originalTotalDue = newFinancials.originalTotalDue
        //         mortgageObj.originalInterestDue = newFinancials.originalInterestDue
        //         mortgageObj.principalPaid = newFinancials.principalPaid
        //         mortgageObj.interestPaid = newFinancials.interestPaid
        //         mortgageObj.principalRemaining = newFinancials.principalRemaining
        //         mortgageObj.interestRemaining = newFinancials.interestRemaining
        //         mortgageObj.payments = newFinancials.payments
        //       }
        //     }
        //   }
        // }
        // if (ownerUpdated && mission !== 'awaitingUpdate') {
        //   mortgageObj.owner1 = owner1
        //   mortgageObj.previousOwner1 = previousOwner1
        //   mortgageObj.owner2 = owner2
        //   mortgageObj.previousOwner2 = previousOwner2
        // }
        let newMortgage = await MortgageModel.findByIdAndUpdate((mortgage._id), mortgageObj, {new: true}).populate('reports')
        newMortgages.push(newMortgage)
        let newLead = await ActiveLeadModel.findByIdAndUpdate((mortgage.activeLead), {
          updates: allLeadUpdates,
          awaitingUpdates: false,
          $push: { timeline: timelineAddition },
        }, {new: true}).populate('belongsToMortgage')
        newLeads.push(newLead)
        let assigneeIds = newLead.assigneeIds
        leadStatus = newLead.status
        await notifyAssignees(assigneeIds, req.body.userId, req.body.mortgageId, newLead._id, newTimelineGuid, "lead", leadStatus)
        if (leadStatus === 'awaitingUpdate' && mission !== 'awaitingUpdate' && mission !== 'finalizeLead' && mission !== 'dismissInvestigation') {
          for (let i = 0; i < assigneeIds.length; i++) {
            await UserModel.findByIdAndUpdate((assigneeIds[i]), {
              $inc: {
                leadsAwaitingVerification: 1,
                leadsAwaitingUpdate: -1,
              }
            })
          }
        }
      }
    }

    if (leadStatus && leadStatus === 'awaitingUpdate' && mission !== 'awaitingUpdate' && mission !== 'finalizeLead' && mission !== 'dismissInvestigation') {
      awaitingUpdateDec = true
      awaitingVerificationInc = true
      await TeamModel.findByIdAndUpdate((teamId), {
        $inc: {
          leadsAwaitingVerification: 1,
          leadsAwaitingUpdate: -1,
        }
      })
    }

    let newLog = null
    if (mission === 'stillInvestigating') {
      newLog = await handleRequestLog('Log', logTime, 'All Discrepancies Resolved', 'Active Leads', [{type: 'Count', detail: newMortgages.length}], 'success', false, req.body.userFullName)
    }
    sendApiSuccessResponse(res, {activeDiscrepancies, rejectedDiscrepancies, resolvedDiscrepancies, newMortgages, newLeads, mission, newLog, newReport, awaitingUpdateDec, awaitingVerificationInc, updateReport }, 'All discrepancies resolved.');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Resolve All Discrepancies', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { resolveAllDiscrepancies }
