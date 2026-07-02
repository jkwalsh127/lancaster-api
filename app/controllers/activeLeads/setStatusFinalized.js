const moment = require('moment');
const TeamModel = require('../../models/team');
const UserModel = require("../../models/user");
const { nanoid } = require('nanoid');
const ReportModel = require('../../models/report');
const ClosureModel = require('../../models/closure');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { formatDates } = require('../../utils/formatDates.utils');
const SweepParameterModel = require('../../models/sweepParameter');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { updateFinancials } = require('../../utils/mortgages/updateFinancials.utils');
const { monthlyStatsDates } = require('../../utils/dates.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats');
const { retrieveFinancials } = require('../../utils/mortgages/retrieveFinancials.utils');
const { recordAssigneeFinalizedStats } = require('../../utils/recordAssigneeFinalizedStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function setStatusFinalized(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info('*** Finalizing the lead')
    console.info(`*** leadID: ${req.body.leadId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let newLead = {}
    let teamStats = {}
    let newReport = {}
    let currentTeam = {}
    let newTimelineGuid = nanoid()
    let timelineAddition = {}
    let leadId = req.body.leadId
    let dates = monthlyStatsDates(todaysDate)
    let activeLead = await ActiveLeadModel.findById(leadId).populate('belongsToMortgage').select("endDate belongsToMortgage assigneeIds assigneeNames targetOutcome tier discrepancies timeline targetProfitNumber targetProfitPercent PostalCodePlus4 tier updates originalDiscrepancies")
    let newTimeline = activeLead.timeline
    let oldMortgage = await MortgageModel.findById(activeLead.belongsToMortgage).select('principalPaid interestPaid principalRemaining interestRemaining mortgageTerm streetAddress recordDetails endDate monthlyPayments originalInterestDue originalLoanAmount originalInterestRate timeline originationDateLabel endDateLabel timeline state postalCode rejectedDiscrepancies resolvedDiscrepancies activeDiscrepancies owner1 previousOwner1 owner2 previousOwner2 originationDate payments')
    let activeDiscrepancies = 0
    let resolvedDiscrepancies = 0
    let rejectedDiscrepancies = 0
    if (!req.body.resolvingRequiredFirst) {
      activeDiscrepancies = req.body.activeDiscrepancies
      rejectedDiscrepancies = req.body.rejectedDiscrepancies
      resolvedDiscrepancies = req.body.resolvedDiscrepancies
    }
    let preserveLead = req.body.preserveLead
    let establishedOutcome = activeLead.targetOutcome
    let outcomeFormatted = establishedOutcome.charAt(0).toUpperCase() + establishedOutcome.slice(1)
    let assigneeNames = activeLead.assigneeNames
    let assigneeIds = activeLead.assigneeIds
    let leadTier = activeLead.tier
    let newTierClosures = 0
    let tierClosuresValue = 0
    let newTierClosuresField = ''
    let monthlyStatTeamGrossProfitNumber = 0
    let Owner1FullName = oldMortgage.owner1
    let Owner2FullName = oldMortgage.owner2
    let PreviousOwner1FullName = oldMortgage.previousOwner1
    let PreviousOwner2FullName = oldMortgage.previousOwner2
    if (req.body.updatedOwners.length > 0) {
      Owner1FullName = req.body.updatedOwners[0].newOwner1
      Owner2FullName = req.body.updatedOwners[0].newOwner2
      PreviousOwner1FullName = req.body.updatedOwners[0].newPreviousOwner1
      PreviousOwner2FullName = req.body.updatedOwners[0].newPreviousOwner2
    }
    
    if (establishedOutcome === 'renegotiation') {
      currentTeam = await TeamModel.findById(req.body.teamId).populate('renegotiationClosures', 'teamTotalProfitAmount teamTotalProfitPercent dateParsed closeDate closeDateLabel').select("teamMonthlyStats closedRefinances closedRenegotiations grossProfitNumber grossProfitPercent renegotiationClosures members renegotiationFrequency lastRenegotiation refinanceFrequency lastRefinance mostRenegotiations mostRenegotiationsAmount mostProfit mostProfitAmount bestRenegotiationFrequencyAmount bestRefinanceFrequencyAmount tier1Closures tier2Closures manualClosures totalClosures dismissedLeads leadsAwaitingUpdate subscription manualRenegotiations manualRefinances tier1Refinances tier2Refinances tier1Renegotiations tier2Renegotiations mortgages totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining")
    } else {
      currentTeam = await TeamModel.findById(req.body.teamId).populate('refinanceClosures', 'teamTotalProfitAmount teamTotalProfitPercent dateParsed closeDate closeDateLabel').select("teamMonthlyStats closedRefinances closedRenegotiations grossProfitNumber grossProfitPercent refinanceClosures members renegotiationFrequency lastRenegotiation refinanceFrequency lastRefinance mostRefinances mostRefinancesAmount mostProfit mostProfitAmount bestRenegotiationFrequency bestRefinanceFrequency bestRenegotiationFrequencyAmount bestRefinanceFrequencyAmount tier1Closures tier2Closures manualClosures totalClosures dismissedLeads leadsAwaitingUpdate subscription manualRenegotiations manualRefinances tier1Refinances tier2Refinances tier1Renegotiations tier2Renegotiations mortgages totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining")
    }
    let totalClosures = currentTeam.totalClosures + 1
    let tier1Closures = currentTeam.tier1Closures
    let tier2Closures = currentTeam.tier2Closures
    let manualClosures = currentTeam.manualClosures
    let tierClosures = 0
    if (leadTier === 1) {
      closureType = 'tier1Closures'
      tier1Closures++
      newTierClosures = tier1Closures
      tierClosures = tier1Closures
      if (establishedOutcome === 'renegotiation') {
        newTierClosuresField = 'tier1Renegotiations'
      } else {
        newTierClosuresField = 'tier1Refinances'
      }
    } else if (leadTier === 2) {
      closureType = 'tier2Closures'
      tier2Closures++
      newTierClosures = tier2Closures
      tierClosures = tier2Closures
      if (establishedOutcome === 'renegotiation') {
        newTierClosuresField = 'tier2Renegotiations'
      } else {
        newTierClosuresField = 'tier2Refinances'
      }
    } else {
      closureType = 'manualClosures'
      manualClosures++
      newTierClosures = manualClosures
      tierClosures = manualClosures
      if (establishedOutcome === 'renegotiation') {
        newTierClosuresField = 'manualRenegotiations'
      } else {
        newTierClosuresField = 'manualRefinances'
      }
    }

    let todaysDateISO = todaysDate.toISOString()
    let todaysDateParsed = Date.parse(todaysDate)
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let todaysDateFileLabel = todaysDate.format("MMM-Do-YYYY")
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let todaysMonthNo = moment(todaysDate).month()
    let sessionLabel = ''
    if (todaysDateISO.substring(5,2) === '01') {
      sessionLabel = moment(todaysDate).format('YYYY')
    } else {
      sessionLabel = moment(todaysDate).format('MMM')
    }
    let sessionLabelFull = moment(todaysDate).format('MMM YYYY')
    let sessionStr = todaysDateISO.substring(0,7)
    let sessionStrToParse = moment(sessionStr)
    let sessionParsed = Date.parse(sessionStrToParse)
    let originalEndDate = moment(req.body.oldFinancials.endDate)

    let oldMonthsRemaining = (originalEndDate.diff(todaysDate, 'months') + 1)
    let monthsPassed = ((oldMortgage.mortgageTerm*12) - oldMonthsRemaining)
    if (monthsPassed === 0) {
      if (todaysDate.diff(closedDate, 'days') >= 0) {
        monthsPassed = 1
        oldMonthsRemaining = oldMonthsRemaining - 1
      }
    }

    let finalizedEndDate = ''
    let finalOriginationDates = {formattedDateLabel:''}
    if (req.body.updatedStartDate) {
      finalizedEndDate = moment(req.body.updatedStartDate).add(req.body.updatedTerm, 'years').subtract(1, 'month')
      let newEndDate = moment(req.body.updatedStartDate)
      let newMonthsRemaining = (newEndDate.diff(todaysDate, 'months') + 1)
      let monthsPassed = ((oldMortgage.mortgageTerm*12) - newMonthsRemaining)
      if (req.body.updatedTerm) {
        monthsPassed = ((req.body.updatedTerm*12) - newMonthsRemaining)
      } else {
        monthsPassed = ((oldMortgage.mortgageTerm*12) - newMonthsRemaining)
      }
      if (monthsPassed === 0) {
        if (todaysDate.diff(closedDate, 'days') >= 0) {
          monthsPassed = 1
          newMonthsRemaining = newMonthsRemaining - 1
        }
      }
      finalOriginationDates = await formatDates(req.body.updatedStartDate)
    } else {
      finalOriginationDates.formattedDateLabel = oldMortgage.originationDateLabel
      finalOriginationDates.formattedDate = oldMortgage.originationDate
      finalizedEndDate = originalEndDate
    }
    let finalEndDates = await formatDates(finalizedEndDate.toISOString())

    let roundedYears = Math.floor(oldMonthsRemaining/12)
    let leftoverMonths = oldMonthsRemaining - (roundedYears * 12)
    let remainingTerm = ''
    let monthsLabel = ''
    if (leftoverMonths === 1) {
      monthsLabel = 'month'
    } else if (leftoverMonths > 1) {
      monthsLabel = 'months'
    }
    let yearsLabel = ''
    if (roundedYears === 1) {
      yearsLabel = 'year'
    } else if (roundedYears > 1) {
      yearsLabel = 'years'
    }
    if (leftoverMonths !== 0 && roundedYears !== 0) {
      remainingTerm = `${roundedYears} ${yearsLabel} and ${leftoverMonths} ${monthsLabel}`
    } else if (roundedYears > 0 && leftoverMonths === 0) {
      remainingTerm = `${roundedYears} ${yearsLabel}`
    } else {
      remainingTerm = `${leftoverMonths} ${monthsLabel}`
    }

    let quarter = ""
    let quarterSession = 0
    if (todaysMonthNo < 3) {
      quarter = "Q1";
      if (todaysMonthNo === 0) {
        quarterSession = 1
      } else if (todaysMonthNo === 1) {
        quarterSession = 2
      } else if (todaysMonthNo === 2) {
        quarterSession = 3
      }
    } else if (todaysMonthNo >= 3 && todaysMonthNo < 6) {
      quarter = "Q2";
      if (todaysMonthNo === 3) {
        quarterSession = 1
      } else if (todaysMonthNo === 4) {
        quarterSession = 2
      } else if (todaysMonthNo === 5) {
        quarterSession = 3
      }
    } else if (todaysMonthNo >= 9) {
      quarter = "Q4";
      if (todaysMonthNo === 9) {
        quarterSession = 1
      } else if (todaysMonthNo === 10) {
        quarterSession = 2
      } else if (todaysMonthNo === 11) {
        quarterSession = 3
      }
    } else {
      quarter = "Q3";
      if (todaysMonthNo === 6) {
        quarterSession = 1
      } else if (todaysMonthNo === 7) {
        quarterSession = 2
      } else if (todaysMonthNo === 8) {
        quarterSession = 3
      }
    }
    let newTeamClosure = {}
    let updatedTeamClosures = []
    let teamClosureIndex = 0
    let teamAmountFromDate = 0
    let teamPercentFromDate = 0
    let teamLastClosureDate = todaysDate.format("MMM Do, YYYY")
    let newMonthlyStat = {}
    let updatedFields = req.body.updatedFields
    let timelineUpdatedFields = req.body.updatedFields
    let oldFinancials = null
    let newTargetProfitNumber = 0
    let newTargetProfitPercent = 0
    let newMonthlyPayments = 0
    let newInterestDue = 0
    let newLoanAmount = 0
    let newPayments = []
    let originalInterestRate = req.body.oldFinancials.originalInterestRate
    let originalLoanAmount = req.body.oldFinancials.originalLoanAmount
    let mortgageTerm = req.body.oldFinancials.mortgageTerm
    let originationDate = req.body.oldFinancials.originationDate
    let originalInterestDue = req.body.oldFinancials.originalInterestDue
    if (!originalInterestDue || isNaN(originalInterestDue)) {
      originalInterestDue = 0
    }
    if (req.body.interestUpdated && establishedOutcome === 'renegotiation') {
      for (let i = 0; i < updatedFields.length; i++) {
        if (updatedFields[i].field === 'PrimaryMortgageInterestRate') {
          originalInterestRate = updatedFields[i].new
        } else if (updatedFields[i].field === 'PrimaryMortgageAmount') {
          originalLoanAmount = updatedFields[i].new
        } else if (updatedFields[i].field === 'PrimaryMortgageTerm') {
          mortgageTerm = updatedFields[i].new
        } else if (updatedFields[i].field === 'PrimaryMortgageStartDate') {
          originationDate = updatedFields[i].new
        }
      }
    }

    let reportUpdatedFields = []
    for (let i = 0; i < activeLead.updates.length; i++) {
      let match = updatedFields.find(item => item.field === activeLead.updates[i].field)
      if (match) {
        let matchIndex = updatedFields.indexOf(match)
        if (match.new.length > 0 && match.old.length > 0) {
          reportUpdatedFields.push(match)
          timelineUpdatedFields.push(match)
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].new.length > 0 && activeLead.updates[i].new.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          timelineUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        } else if (match.new.length > 0) {
          reportUpdatedFields.push(match)
          timelineUpdatedFields.push(match)
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].new.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          timelineUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        } else if (match.old.length > 0) {
          reportUpdatedFields.push(match)
          timelineUpdatedFields.push(match)
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].old.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          timelineUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        }
      } else {
        reportUpdatedFields.push(activeLead.updates[i])
      }
    }
    // for (let i = 0; i < updatedFields.length; i++) {
    //   reportUpdatedFields.push(updatedFields[i])
    // }
    
    let timelineOwnershipUpdates = []
    if (req.body.updatedOwners.length > 0) {
      if (Owner1FullName !== PreviousOwner1FullName) {
        reportUpdatedFields.push(
          {
            field: 'Ownership',
            label: 'Primary Owner',
            old: PreviousOwner1FullName,
            new: Owner1FullName,
          },
        )
        timelineOwnershipUpdates.push(
          {
            field: 'Ownership',
            label: 'Primary Owner',
            old: PreviousOwner1FullName,
            new: Owner1FullName,
          },
        )
      }
      if (Owner2FullName !== PreviousOwner2FullName) {
        reportUpdatedFields.push(
          {
            field: 'Ownership',
            label: 'Previous Co-Owner',
            old: PreviousOwner2FullName,
            new: Owner2FullName,
          },
        )
        timelineOwnershipUpdates.push(
          {
            field: 'Ownership',
            label: 'Previous Co-Owner',
            old: PreviousOwner2FullName,
            new: Owner2FullName,
          },
        )
      }
    }

    if (originalLoanAmount && originalInterestRate && mortgageTerm) {
      oldFinancials = await retrieveFinancials(
        oldMortgage.originationDate,
        originalLoanAmount,
        originalInterestRate,
        mortgageTerm,
        originalInterestRate,
        oldMortgage.payments,
      )
    }
    let newFinancials = await updateFinancials(
      finalOriginationDates.formattedDate,
      req.body.updatedPrincipal,
      req.body.updatedInterestRate,
      req.body.updatedTerm,
      req.body.updatedInterestRate,
      oldMortgage.payments,
      paymentYear = null,
      paymentMonth = null,
      paymentAmount = null,
      oldMortgage.assessedPropertyValue,
      req.body.teamId,
    )
    let originalLoanAmountDifference = 0
    let originalInterestDifference = 0
    let principalRemainingDifference = 0
    let interestRemainingDifference = 0
    if (!req.body.reportGenerated) {
      newPayments = newFinancials.payments
      newMonthlyPayments = newFinancials.monthlyPayments
      newInterestDue = newFinancials.interestRemaining
      newLoanAmount = newFinancials.principalRemaining
      newTargetProfitNumber = (Math.round((newFinancials.interestRemaining - oldFinancials.interestRemaining)*10000)/10000)
      newTargetProfitPercent = ((Math.round(((newFinancials.interestRemaining / oldFinancials.interestRemaining)*100)-100)*10000)/10000)
      newPayments = newFinancials.payments
      originalLoanAmountDifference = (Math.round((newFinancials.originalLoanAmount - oldFinancials.originalLoanAmount)*10000)/10000)
      originalInterestDifference = (Math.round((newFinancials.originalInterestDue - oldFinancials.originalInterestDue)*10000)/10000)
      principalRemainingDifference = (Math.round((newFinancials.principalRemaining - oldFinancials.principalRemaining)*10000)/10000)
      interestRemainingDifference = (Math.round((newFinancials.interestRemaining - oldFinancials.interestRemaining)*10000)/10000)
    } else {
      newPayments = oldFinancials.payments
      newMonthlyPayments = oldFinancials.monthlyPayments
      newInterestDue = oldFinancials.interestRemaining
      newLoanAmount = oldFinancials.principalRemaining
      newTargetProfitNumber = oldFinancials.targetProfitNumber
      newTargetProfitPercent = oldFinancials.targetProfitPercent
      newPayments = oldFinancials.payments
      originalLoanAmountDifference = newFinancials.originalLoanAmount
      originalInterestDifference = newFinancials.originalInterestDue
      principalRemainingDifference = newFinancials.principalRemaining
      interestRemainingDifference = newFinancials.interestRemaining
    }

    let teamMonthlyStat = {}
    let existingMonthlyStat = false
    if (establishedOutcome === 'renegotiation') {
      let monthlyStatTeamClosedRenegotiations = 1
      let statIndex = (currentTeam.teamMonthlyStats.length - 1)
      for (let i = currentTeam.teamMonthlyStats.length; i > 0; i--) {
        teamMonthlyStat = await TeamMonthlyStatsModel.findById(currentTeam.teamMonthlyStats[statIndex]).select("sessionParsed closedRenegotiations tier1Renegotiations tier2Renegotiations manualRenegotiations");
        if (teamMonthlyStat.sessionParsed === sessionParsed) {
          if (newTierClosuresField === 'tier1Renegotiations') {
            tierClosuresValue = teamMonthlyStat.tier1Renegotiations + 1
          } else if (newTierClosuresField === 'tier2Renegotiations') {
            tierClosuresValue = teamMonthlyStat.tier2Renegotiations + 1
          } else {
            tierClosuresValue = teamMonthlyStat.manualRenegotiations + 1
          }
          existingMonthlyStat = true
          monthlyStatTeamClosedRenegotiations = teamMonthlyStat.closedRenegotiations + 1
          break
        } else if (teamMonthlyStat.sessionParsed < sessionParsed) {
          break
        }
        if (statIndex !== 0) {
          statIndex--
        }
      }
  
      if (existingMonthlyStat) {
        newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((teamMonthlyStat._id), {
          closedRenegotiations: monthlyStatTeamClosedRenegotiations,
          [newTierClosuresField]: tierClosuresValue,
        }, {new: true})
      } else {
        newMonthlyStat = new TeamMonthlyStatsModel({
          belongsToTeam: currentTeam._id,
          sessionParsed: sessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: todaysMonthNo,
          quarter: quarter,
          quarterSession: quarterSession,
          [newTierClosuresField]: 1,
          closedRenegotiations: 1,
        })
        await newMonthlyStat.save()
      }

      for (let i = 0; i < currentTeam.renegotiationClosures.length; i++) {
        if (currentTeam.renegotiationClosures[i].dateParsed <= todaysDateParsed) {
          teamAmountFromDate = currentTeam.renegotiationClosures[i].teamTotalProfitAmount
          teamPercentFromDate = currentTeam.renegotiationClosures[i].teamTotalProfitPercent
          teamClosureIndex = i
          break
        } else if (i === (currentTeam.renegotiationClosures.length - 1)) {
          teamClosureIndex = (i + 1)
        }
        if (i === 0) {
          teamLastClosureDate = currentTeam.renegotiationClosures[i].closeDateLabel
        }
      }

      timelineAddition = {
        guid: newTimelineGuid,
        date: todaysDateLabel, 
        contributor: req.body.userFullName, 
        targetOutcome: establishedOutcome,
        milestone: 'Investigation Finalized', 
        details: timelineUpdatedFields,
        ownershipUpdates: timelineOwnershipUpdates,
        notify: false
      }
      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        timelineAddition.awaitingUpdate = true
      }
      newTimeline.push(timelineAddition)
      newReport = new ReportModel({
        belongsToLead: leadId,
        belongsToMortgage: oldMortgage._id,
        status: 'new',
        type: 'finalized',
        outcome: 'renegotiation',
        streetAddress: oldMortgage.streetAddress,
        City: oldMortgage.recordDetails.address.City.currentValue,
        StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
        PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
        dateGenerated: todaysDateLabel,
        dateGeneratedFileLabel: todaysDateFileLabel,
        Owner1FullName: Owner1FullName,
        Owner2FullName: Owner2FullName,
        PreviousOwner1FullName: PreviousOwner1FullName,
        PreviousOwner2FullName: PreviousOwner2FullName,
        tier: activeLead.tier,
        discrepancies: activeLead.discrepancies,
        assignees: assigneeNames,
        remainingTermAtClosing: remainingTerm,
        timeline: newTimeline,
        updates: reportUpdatedFields,
        originalOriginationDate: req.body.oldFinancials.originationDate,
        originalEndDate: req.body.oldFinancials.endDateLabel,
        originalLoanAmount: originalLoanAmount,
        originalInterestDue: originalInterestDue,
        originalInterestRate: originalInterestRate,
        originalMonthlyPayments: req.body.oldFinancials.monthlyPayments,
      })
      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        newReport.awaitingUpdate = true
      }
      if (oldFinancials) {
        newReport.originalInterestDue = oldFinancials.originalInterestDue
        newReport.originalMonthlyPayments = oldFinancials.monthlyPayments
        newReport.principalPaidAtClosing = oldFinancials.principalPaid
        newReport.interestPaidAtClosing = oldFinancials.interestPaid
        newReport.principalRemainingAtClosing = oldFinancials.principalRemaining
        newReport.interestRemainingAtClosing = oldFinancials.interestRemaining
      }
      await newReport.save();
      newReport.notifyUser = true
      newTeamClosure = new ClosureModel({
        outcome: establishedOutcome,
        closedMortgage: oldMortgage._id,
        report: newReport._id,
        streetAddress: oldMortgage.streetAddress,
        City: oldMortgage.recordDetails.address.City.currentValue,
        StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
        PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
        PostalCodePlus4: oldMortgage.recordDetails.address.PostalCodePlus4.currentValue,
        assigneeNames: assigneeNames,
        closeDate: todaysDate,
        closeDateLabel: todaysDateLabel,
        originalOriginationDate: moment(oldMortgage.originationDate).format("MMM Do, YYYY"),
        originalEndDate: moment(oldMortgage.endDate).format("MMM Do, YYYY"),
        originalInterestRate: req.body.oldFinancials.originalInterestRate,
        originalPrincipalDue: req.body.oldFinancials.originalLoanAmount,
        originalInterestDue: oldMortgage.originalInterestDue,
        updates: reportUpdatedFields,
        dateParsed: todaysDateParsed,
      })
      await newTeamClosure.save();
      let frequencyDiff = 0
      if (currentTeam.renegotiationClosures.length > 0) {
        if ((Date.parse(currentTeam.renegotiationClosures[(currentTeam.renegotiationClosures.length - 1)].closeDate) > Date.parse(todaysDate))) {
          frequencyDiff = moment(todaysDate).diff(moment(todaysDate), 'days')
        } else {
          let previousClosureDate = moment(new Date(currentTeam.renegotiationClosures[(currentTeam.renegotiationClosures.length - 1)].closeDate))
          frequencyDiff = moment(todaysDate).diff(previousClosureDate, 'days')
        }
      } else {
        frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
      }
      if (frequencyDiff < 0) {
        frequencyDiff = frequencyDiff * -1
      }
      let newFrequency = (Math.round((frequencyDiff/(currentTeam.closedRenegotiations + 1))*10)/10)
      if (isNaN(newFrequency) || newFrequency === 0) {
        newFrequency = 0
      }
      let tier1Closures = currentTeam.tier1Closures
      let tier2Closures = currentTeam.tier2Closures
      let manualClosures = currentTeam.manualClosures
      let tier1Renegotiations = currentTeam.tier1Renegotiations
      let tier2Renegotiations = currentTeam.tier2Renegotiations
      let manualRenegotiations = currentTeam.manualRenegotiations
      if (leadTier === 1) {
        tier1Closures = tier1Closures + 1
        tier1Renegotiations = tier1Renegotiations + 1
      } else if (leadTier === 2) {
        tier2Closures = tier2Closures + 1
        tier2Renegotiations = tier2Renegotiations + 1
      } else {
        manualClosures = manualClosures + 1
        manualRenegotiations = manualRenegotiations + 1
      }
      teamStats = {
        outcome: 'renegotiation',
        totalClosures: currentTeam.totalClosures + 1,
        closedRenegotiations: currentTeam.closedRenegotiations + 1,
        tier1Renegotiations: tier1Renegotiations,
        tier2Renegotiations: tier2Renegotiations,
        manualRenegotiations: manualRenegotiations,
        tier1Closures: tier1Closures,
        tier2Closures: tier2Closures,
        manualClosures: manualClosures,
        lastRenegotiation: teamLastClosureDate,
        renegotiationFrequency: newFrequency,
        closedRefinances: currentTeam.closedRefinances,
      }
      
      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        if (existingMonthlyStat) {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRenegotiations: currentTeam.closedRenegotiations + 1,
            lastRenegotiation: teamLastClosureDate,
            renegotiationFrequency: newFrequency,
            [newTierClosuresField]: tierClosures,
            $inc: {
              leadsAwaitingUpdate: 1,
            },
            $pull: { closingLeads: leadId },
            $push: {
              awaitingUpdateLeads: {
                $each: [ leadId ],
                $position: teamClosureIndex
              },
              renegotiationClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              }
            }
          })
        } else {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRenegotiations: currentTeam.closedRenegotiations + 1,
            lastRenegotiation: teamLastClosureDate,
            renegotiationFrequency: newFrequency,
            [newTierClosuresField]: tierClosures,
            $inc: {
              leadsAwaitingUpdate: 1,
            },
            $pull: { closingLeads: leadId },
            $push: {
              awaitingUpdateLeads: {
                $each: [ leadId ],
                $position: teamClosureIndex
              },
              renegotiationClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              teamMonthlyStats: {
                $each: [ newMonthlyStat._id ],
                $position: 0,
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              }
            }
          })
        }

        newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
          status: 'awaitingUpdate',
          awaitingUpdates: true,
          reportGenerated: true,
          timeline: newTimeline,
          $push: {
            reports: {
              $each: [ newReport._id ],
              $position: 0
            },
          },
        })
      } else {
        if (existingMonthlyStat) {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRenegotiations: currentTeam.closedRenegotiations + 1,
            lastRenegotiation: teamLastClosureDate,
            renegotiationFrequency: newFrequency,
            [newTierClosuresField]: tierClosures,
            $pull: { closingLeads: leadId },
            $push: {
              renegotiationClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              }
            }
          })
        } else {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRenegotiations: currentTeam.closedRenegotiations + 1,
            lastRenegotiation: teamLastClosureDate,
            renegotiationFrequency: newFrequency,
            [newTierClosuresField]: tierClosures,
            $pull: { closingLeads: leadId },
            $push: {
              renegotiationClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              teamMonthlyStats: {
                $each: [ newMonthlyStat._id ],
                $position: 0,
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              }
            }
          })
        }
      }
    } else {
      if (oldFinancials) {
        newTargetProfitPercent = ((Math.round(((newFinancials.interestRemaining / oldFinancials.interestRemaining)*100)-100)*10000)/10000)
        newTargetProfitNumber = (Math.round((newFinancials.interestRemaining - oldFinancials.interestRemaining)*10000)/10000)
      } else {
        newTargetProfitNumber = (Math.round((newFinancials.targetProfitNumber)*10000)/10000)
        newTargetProfitPercent = ((Math.round(((newFinancials.targetProfitPercent)*100)-100)*10000)/10000)
      }
      let monthlyStatTeamClosedRefinances = 1
      let statIndex = (currentTeam.teamMonthlyStats.length - 1)
      monthlyStatTeamGrossProfitNumber = newTargetProfitNumber
      let monthlyStatTeamGrossProfitPercent = newTargetProfitPercent
      let monthlyStatGrossProfitNumber = newTargetProfitNumber
      let monthlyStatGrossProfitPercent = newTargetProfitPercent
      for (let i = currentTeam.teamMonthlyStats.length; i > 0; i--) {
        teamMonthlyStat = await TeamMonthlyStatsModel.findById(currentTeam.teamMonthlyStats[statIndex]).select("sessionParsed grossProfitNumber grossProfitPercent teamGrossProfitNumber teamGrossProfitPercent closedRefinances tier1Refinances tier2Refinances manualRefinances");
        if (teamMonthlyStat.sessionParsed === sessionParsed) {
          existingMonthlyStat = true
          monthlyStatTeamClosedRefinances = teamMonthlyStat.closedRefinances + 1
          monthlyStatTeamGrossProfitNumber = monthlyStatTeamGrossProfitNumber + teamMonthlyStat.teamGrossProfitNumber
          monthlyStatTeamGrossProfitPercent = monthlyStatTeamGrossProfitPercent + teamMonthlyStat.teamGrossProfitPercent
          monthlyStatGrossProfitNumber = monthlyStatGrossProfitNumber + teamMonthlyStat.grossProfitNumber
          monthlyStatGrossProfitPercent = monthlyStatGrossProfitPercent + teamMonthlyStat.grossProfitPercent
          if (newTierClosuresField === 'tier1Refinances') {
            tierClosuresValue = teamMonthlyStat.tier1Refinances + 1
          } else if (newTierClosuresField === 'tier2Refinances') {
            tierClosuresValue = teamMonthlyStat.tier2Refinances + 1
          } else {
            tierClosuresValue = teamMonthlyStat.manualRefinances + 1
          }
          break
        } else if (teamMonthlyStat.sessionParsed < sessionParsed) {
          break
        }
        if (statIndex !== 0) {
          statIndex--
        }
      }

      if (existingMonthlyStat) {
        newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((teamMonthlyStat._id), {
          closedRefinances: monthlyStatTeamClosedRefinances,
          grossProfitNumber: monthlyStatGrossProfitNumber,
          grossProfitPercent: monthlyStatGrossProfitPercent,
          teamGrossProfitNumber: monthlyStatTeamGrossProfitNumber,
          teamGrossProfitPercent: monthlyStatTeamGrossProfitPercent,
          [newTierClosuresField]: tierClosuresValue,
        }, {new: true})
      } else {
        newMonthlyStat = new TeamMonthlyStatsModel({
          belongsToTeam: currentTeam._id,
          sessionParsed: sessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: todaysMonthNo,
          quarterSession: quarterSession,
          quarter: quarter,
          closedRefinances: 1,
          [newTierClosuresField]: 1,
          grossProfitNumber: monthlyStatGrossProfitNumber,
          grossProfitPercent: monthlyStatGrossProfitPercent,
          teamGrossProfitNumber: monthlyStatTeamGrossProfitNumber,
          teamGrossProfitPercent: monthlyStatTeamGrossProfitPercent,
        })
        await newMonthlyStat.save()
      }

      for (let i = 0; i < currentTeam.refinanceClosures.length; i++) {
        if (currentTeam.refinanceClosures[i].dateParsed <= todaysDateParsed) {
          teamAmountFromDate = currentTeam.refinanceClosures[i].teamTotalProfitAmount
          teamPercentFromDate = currentTeam.refinanceClosures[i].teamTotalProfitPercent
          teamClosureIndex = i
          break
        } else if (i === (currentTeam.refinanceClosures.length - 1)) {
          teamClosureIndex = (i + 1)
        }
        if (i === 0) {
          teamLastClosureDate = currentTeam.refinanceClosures[i].closeDateLabel
        }
      }

      let numberNegative = false
      let percentNegative = false
      if (Math.round(newTargetProfitNumber) < 0) {
        newTargetProfitNumber = newTargetProfitNumber*-1
        numberNegative = true
      }
      if (Math.round(newTargetProfitPercent) < 0) {
        newTargetProfitPercent = newTargetProfitPercent*-1
        percentNegative = true
      }
    
      timelineAddition = {
        guid: newTimelineGuid,
        date: todaysDateLabel, 
        contributor: req.body.userFullName, 
        targetOutcome: establishedOutcome,
        milestone: 'Investigation Finalized', 
        details: timelineUpdatedFields,
        ownershipUpdates: timelineOwnershipUpdates,
        activeDiscrepancies: activeDiscrepancies,
        rejectedDiscrepancies: rejectedDiscrepancies,
        resolvedDiscrepancies: resolvedDiscrepancies,
        newProfits: {
          profitNumber: {
            new: newTargetProfitNumber,
            negative: numberNegative 
          },
          profitPercent: {
            new: newTargetProfitPercent,
            negative: percentNegative
          }
        }, 
        notify: false
      }
      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        timelineAddition.awaitingUpdate = true
      }
      newTimeline.push(timelineAddition)

      newReport = new ReportModel({
        belongsToLead: leadId,
        belongsToMortgage: oldMortgage._id,
        status: 'new',
        type: 'finalized',
        outcome: 'refinance',
        streetAddress: oldMortgage.streetAddress,
        City: oldMortgage.recordDetails.address.City.currentValue,
        StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
        PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
        dateGenerated: todaysDateLabel,
        dateGeneratedFileLabel: todaysDateFileLabel,
        Owner1FullName: Owner1FullName,
        Owner2FullName: Owner2FullName,
        PreviousOwner1FullName: PreviousOwner1FullName,
        PreviousOwner2FullName: PreviousOwner2FullName,
        tier: activeLead.tier,
        discrepancies: activeLead.discrepancies,
        assignees: assigneeNames,
        remainingTermAtClosing: remainingTerm,
        timeline: newTimeline,
        newLoanAmount: newFinancials.originalLoanAmount,
        newInterestDue: newFinancials.interestRemaining,
        newMonthlyPayments: newFinancials.monthlyPayments,
        newStartDate: finalOriginationDates.formattedDateLabel,
        newEndDate: finalEndDates.formattedDateLabel,
        profitAmount: newTargetProfitNumber,
        profitPercent: newTargetProfitPercent,
        teamTotalProfitAmount: teamAmountFromDate + newTargetProfitNumber,
        teamTotalProfitPercent: teamPercentFromDate + newTargetProfitPercent,
        updates: reportUpdatedFields,
        originalOriginationDate: req.body.oldFinancials.originationDate,
        originalEndDate: req.body.oldFinancials.endDateLabel,
        originalLoanAmount: originalLoanAmount,
        originalInterestDue: originalInterestDue,
        originalInterestRate: originalInterestRate,
        originalMonthlyPayments: req.body.oldFinancials.monthlyPayments,
        newInterestRate: req.body.updatedInterestRate,
      })
      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        newReport.awaitingUpdate = true
      }
      if (oldFinancials) {
        newReport.originalInterestDue = oldFinancials.originalInterestDue
        newReport.originalMonthlyPayments = oldFinancials.monthlyPayments
        newReport.principalPaidAtClosing = oldFinancials.principalPaid
        newReport.interestPaidAtClosing = oldFinancials.interestPaid
        newReport.principalRemainingAtClosing = oldFinancials.principalRemaining
        newReport.interestRemainingAtClosing = oldFinancials.interestRemaining
      }
      await newReport.save()
      newReport.notifyUser = true

      newTeamClosure = new ClosureModel({
        outcome: establishedOutcome,
        closedMortgage: oldMortgage._id,
        report: newReport._id,
        streetAddress: oldMortgage.streetAddress,
        City: oldMortgage.recordDetails.address.City.currentValue,
        StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
        PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
        PostalCodePlus4: oldMortgage.recordDetails.address.PostalCodePlus4.currentValue,
        assigneeNames: assigneeNames,
        closeDate: todaysDate,
        closeDateLabel: todaysDateLabel,
        originalOriginationDate: moment(oldMortgage.originationDate).format("MMM Do, YYYY"),
        originalEndDate: moment(oldMortgage.endDate).format("MMM Do, YYYY"),
        newOriginationDate: finalOriginationDates.formattedDateLabel,
        newEndDate: finalEndDates.formattedDateLabel,
        originalInterestRate: req.body.oldFinancials.originalInterestRate,
        originalPrincipalDue: req.body.oldFinancials.originalLoanAmount,
        originalInterestDue: oldMortgage.originalInterestDue,
        profitAmount: newTargetProfitNumber,
        profitPercent: newTargetProfitPercent,
        teamTotalProfitAmount: teamAmountFromDate + newTargetProfitNumber,
        teamTotalProfitPercent: teamPercentFromDate + newTargetProfitPercent,
        updates: reportUpdatedFields,
        remainingTerm: remainingTerm,
        remainingPrincipal: newFinancials.principalRemaining,
        remainingInterest: newFinancials.interestRemaining,
        newPrincipal: req.body.updatedPrincipal,
        newInterestRate: req.body.updatedInterestRate,
        newInterestDue: newFinancials.interestRemaining,
        dateParsed: todaysDateParsed,
      });
      await newTeamClosure.save();
      let frequencyDiff = 0
      if (currentTeam.refinanceClosures.length > 0) {
        if ((Date.parse(currentTeam.refinanceClosures[(currentTeam.refinanceClosures.length - 1)].closeDate) > Date.parse(todaysDate))) {
          frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
        } else {
          let previousClosureDate = new Date((currentTeam.refinanceClosures[(currentTeam.refinanceClosures.length - 1)].closeDate))
          frequencyDiff = moment(todaysDate).diff(previousClosureDate, 'days')
        }
      } else {
        frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
      }
      if (frequencyDiff < 0) {
        frequencyDiff = frequencyDiff * -1
      }
      let newFrequency = (Math.round((frequencyDiff/(currentTeam.closedRefinances + 1))*10)/10)
      if (isNaN(newFrequency) || newFrequency === 0) {
        newFrequency = 0
      }
      let newAverageProfitNumber = (currentTeam.grossProfitNumber + newTargetProfitNumber)/(currentTeam.closedRefinances + 1)
      let newaverageProfitPercent = (currentTeam.grossProfitPercent + newTargetProfitPercent)/(currentTeam.closedRefinances + 1)
      let tier1Closures = currentTeam.tier1Closures
      let tier2Closures = currentTeam.tier2Closures
      let manualClosures = currentTeam.manualClosures
      let tier1Refinances = currentTeam.tier1Refinances
      let tier2Refinances = currentTeam.tier2Refinances
      let manualRefinances = currentTeam.manualRefinances
      if (leadTier === 1) {
        tier1Closures = tier1Closures + 1
        tier1Refinances = tier1Refinances + 1
      } else if (leadTier === 2) {
        tier2Closures = tier2Closures + 1
        tier2Refinances = tier2Refinances + 1
      } else {
        manualClosures = manualClosures + 1
        manualRefinances = manualRefinances + 1
      }
      teamStats = {
        outcome: 'refinance',
        totalClosures: currentTeam.totalClosures + 1,
        closedRefinances: currentTeam.closedRefinances + 1,
        tier2Refinances: tier2Refinances,
        tier1Refinances: tier1Refinances,
        manualRefinances: manualRefinances,
        tier1Closures: tier1Closures,
        tier2Closures: tier2Closures,
        manualClosures: manualClosures,
        lastRefinance: teamLastClosureDate,
        refinanceFrequency: newFrequency,
        grossProfitNumber: (currentTeam.grossProfitNumber + newTargetProfitNumber),
        grossProfitPercent: (currentTeam.grossProfitPercent + newTargetProfitPercent),
        closedRenegotiations: currentTeam.closedRenegotiations + 1,
        averageProfitNumber: newAverageProfitNumber,
        averageProfitPercent: newaverageProfitPercent,
        totalClosures: totalClosures,
      }

      let assessmentValueDifference = 0
      if (oldMortgage.recordDetails.assessment.AssessedValue.originalDiscrepancy) {
        assessmentValueDifference = parseFlot(oldMortgage.recordDetails.assessment.AssessedValue.currentValue) - parseFlot(oldMortgage.recordDetails.assessment.AssessedValue.originalValue)
      }

      if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead) {
        if (existingMonthlyStat) {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRefinances: currentTeam.closedRefinances + 1,
            lastRefinance: teamLastClosureDate,
            refinanceFrequency: newFrequency,
            grossProfitNumber: currentTeam.grossProfitNumber + newTargetProfitNumber,
            grossProfitPercent: currentTeam.grossProfitPercent + newTargetProfitPercent,
            averageProfitNumber: newAverageProfitNumber,
            averageProfitPercent: newaverageProfitPercent,
            [newTierClosuresField]: tierClosures,
            $inc: {
              leadsAwaitingUpdate: 1,
              totalOriginalLoanAmount: originalLoanAmountDifference,
              totalOriginalInterest: originalInterestDifference,
              totalPrincipalRemaining: principalRemainingDifference,
              totalInterestRemaining: interestRemainingDifference,
              totalAssessedPropertyValue: assessmentValueDifference,
            },
            $pull: { closingLeads: leadId },
            $push: { 
              awaitingUpdateLeads: {
                $each: [ leadId ],
                $position: 0
              },
              refinanceClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              },
            }
          })
        } else {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRefinances: currentTeam.closedRefinances + 1,
            lastRefinance: teamLastClosureDate,
            refinanceFrequency: newFrequency,
            grossProfitNumber: currentTeam.grossProfitNumber + newTargetProfitNumber,
            grossProfitPercent: currentTeam.grossProfitPercent + newTargetProfitPercent,
            averageProfitNumber: newAverageProfitNumber,
            averageProfitPercent: newaverageProfitPercent,
            [newTierClosuresField]: tierClosures,
            $inc: {
              leadsAwaitingUpdate: 1,
              totalOriginalLoanAmount: originalLoanAmountDifference,
              totalOriginalInterest: originalInterestDifference,
              totalPrincipalRemaining: principalRemainingDifference,
              totalInterestRemaining: interestRemainingDifference,
              totalAssessedPropertyValue: assessmentValueDifference,
            },
            $pull: { closingLeads: leadId },
            $push: { 
              awaitingUpdateLeads: {
                $each: [ leadId ],
                $position: 0
              },
              refinanceClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              teamMonthlyStats: {
                $each: [ newMonthlyStat._id ],
                $position: 0,
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              },
            }
          })
        }
        newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
          status: 'awaitingUpdate',
          awaitingUpdates: true,
          reportGenerated: true,
          timeline: newTimeline,
          $push: {
            reports: {
              $each: [ newReport._id ],
              $position: 0
            },
          },
        })
      } else {
        if (existingMonthlyStat) {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRefinances: currentTeam.closedRefinances + 1,
            lastRefinance: teamLastClosureDate,
            refinanceFrequency: newFrequency,
            grossProfitNumber: currentTeam.grossProfitNumber + newTargetProfitNumber,
            grossProfitPercent: currentTeam.grossProfitPercent + newTargetProfitPercent,
            averageProfitNumber: newAverageProfitNumber,
            averageProfitPercent: newaverageProfitPercent,
            [newTierClosuresField]: tierClosures,
            $inc: {
              totalOriginalLoanAmount: originalLoanAmountDifference,
              totalOriginalInterest: originalInterestDifference,
              totalPrincipalRemaining: principalRemainingDifference,
              totalInterestRemaining: interestRemainingDifference,
              totalAssessedPropertyValue: assessmentValueDifference,
            },
            $pull: { closingLeads: leadId },
            $push: { 
              refinanceClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              },
            }
          })
        } else {
          await currentTeam.updateOne({
            tier1Closures: tier1Closures,
            tier2Closures: tier2Closures,
            manualClosures: manualClosures,
            totalClosures: totalClosures,
            closedRefinances: currentTeam.closedRefinances + 1,
            lastRefinance: teamLastClosureDate,
            refinanceFrequency: newFrequency,
            grossProfitNumber: currentTeam.grossProfitNumber + newTargetProfitNumber,
            grossProfitPercent: currentTeam.grossProfitPercent + newTargetProfitPercent,
            averageProfitNumber: newAverageProfitNumber,
            averageProfitPercent: newaverageProfitPercent,
            [newTierClosuresField]: tierClosures,
            $inc: {
              totalOriginalLoanAmount: originalLoanAmountDifference,
              totalOriginalInterest: originalInterestDifference,
              totalPrincipalRemaining: principalRemainingDifference,
              totalInterestRemaining: interestRemainingDifference,
              totalAssessedPropertyValue: assessmentValueDifference,
            },
            $pull: { closingLeads: leadId },
            $push: { 
              refinanceClosures: {
                $each: [ newTeamClosure._id ],
                $position: teamClosureIndex
              },
              reports: {
                $each: [ newReport._id ],
                $position: 0
              },
              teamMonthlyStats: {
                $each: [ newMonthlyStat._id ],
                $position: 0,
              },
              portfolioMonthlyStats: {
                $each: newFinancials.newPortfolioStats,
              },
            }
          })
        }
      }

      for (let i = 0; i < teamClosureIndex; i++) {
        let thisClosure = await ClosureModel.findById(currentTeam.refinanceClosures[i]._id).select('teamTotalProfitAmount teamTotalProfitPercent')
        thisClosure = await ClosureModel.findByIdAndUpdate((thisClosure._id), {
          teamTotalProfitAmount: thisClosure.teamTotalProfitAmount + newTargetProfitNumber,
          teamTotalProfitPercent: thisClosure.teamTotalProfitPercent + newTargetProfitPercent,
        }, { new: true})
        updatedTeamClosures.push(thisClosure)
      }
    }

    let newMortgage = {}
    if ((activeDiscrepancies > 0 || rejectedDiscrepancies > 0 || preserveLead )) {
      newMortgage = await MortgageModel.findByIdAndUpdate((oldMortgage._id), {
        status: 'awaitingUpdate',
        reportGenerated: true,
        awaitingUpdates: true,
        // mortgageTerm: req.body.updatedTerm,
        // originationDate: finalOriginationDates.formattedDate,
        // originationDateLabel: finalOriginationDates.formattedDateLabel,
        // endDate: finalEndDates.formattedDate,
        // endDateLabel: finalEndDates.formattedDateLabel,
        // originalLoanAmount: req.body.updatedPrincipal,
        // originalInterestRate: req.body.updatedInterestRate,
        // monthlyPayments: newFinancials.monthlyPayments,
        // originalTotalDue: newFinancials.principalRemaining,
        // originalInterestDue: newFinancials.interestRemaining,
        activeDiscrepancies: activeDiscrepancies,
        rejectedDiscrepancies: rejectedDiscrepancies,
        resolvedDiscrepancies: resolvedDiscrepancies,
        lastUpdateDate: todaysDate.format("MMM Do, YYYY"),
        lastUpdateType: outcomeFormatted,
        payments: newPayments,
        $push: { 
          reports: {
            $each: [ newReport._id ],
            $position: 0
          },
          timeline: timelineAddition,
        }
      }, {new: true});
    } else {
      newMortgage = await MortgageModel.findByIdAndUpdate((oldMortgage._id), {
        status: 'inactive',
        mortgageTerm: req.body.updatedTerm,
        originationDate: finalOriginationDates.formattedDate,
        originationDateLabel: finalOriginationDates.formattedDateLabel,
        endDate: finalEndDates.formattedDate,
        endDateLabel: finalEndDates.formattedDateLabel,
        originalLoanAmount: req.body.updatedPrincipal,
        originalInterestRate: req.body.updatedInterestRate,
        activeDiscrepancies: activeDiscrepancies,
        rejectedDiscrepancies: rejectedDiscrepancies,
        resolvedDiscrepancies: resolvedDiscrepancies,
        monthlyPayments: newFinancials.monthlyPayments,
        originalTotalDue: newFinancials.principalRemaining,
        originalInterestDue: newFinancials.interestRemaining,
        lastUpdateDate: todaysDate.format("MMM Do, YYYY"),
        lastUpdateType: outcomeFormatted,
        activeLead: null,
        activeLeadTier: null,
        payments: newPayments,
        $push: { 
          reports: {
            $each: [ newReport._id ],
            $position: 0
          },
          timeline: timelineAddition,
        }
      }, {new: true});
    }
    
    let returnMonthlyStat = await TeamMonthlyStatsModel.findById(newMonthlyStat._id)

    let newParameterStats = []
    for (let i = 0; i < activeLead.originalDiscrepancies.length; i++) {
      let sweepParameter = null
      if (establishedOutcome === 'renegotiation') {
        sweepParameter = await SweepParameterModel.findOneAndUpdate({apiMapping: activeLead.originalDiscrepancies[i]}, {$inc: { renegotiations: 1 } }, {new: true})
      } else {
        sweepParameter = await SweepParameterModel.findOneAndUpdate({apiMapping: activeLead.originalDiscrepancies[i]}, {$inc: { refinances: 1 } }, {new: true})
      }
      if (sweepParameter) {
        newParameterStats.push(sweepParameter)
      }
    }

    let newQuarterBreakdown = {}
    if (establishedOutcome === 'refinance') {
      newQuarterBreakdown.closureGross = newTargetProfitNumber
    }
    if (activeDiscrepancies === 0 && rejectedDiscrepancies === 0 && !preserveLead) {
      await ActiveLeadModel.findByIdAndUpdate((leadId), {
        isActive: false,
        dateDeleted: todaysDate,
        timeline: newTimeline,
        $push: {
          reports: {
            $each: [ newReport._id ],
            $position: 0
          },
        },
      })
    }

    let verifyLead = false
    let assigneeUpdateObjs = []
    let returnMemberMonthlyStats = []
    if (currentTeam.subscription[0] === 'enterprise') {
      updateAssigneeStats = await recordAssigneeFinalizedStats(assigneeIds, activeLead._id, newReport._id, activeDiscrepancies, establishedOutcome, newTargetProfitNumber, newTargetProfitPercent, sessionParsed, preserveLead, verifyLead)
      assigneeUpdateObjs = updateAssigneeStats.assigneeUpdateObjs
      returnMemberMonthlyStats = updateAssigneeStats.returnMemberMonthlyStats
    } else {
      for (let i = 0; i < assigneeIds.length; i++) {
        let assignee = await UserModel.findById(assigneeIds[i]).select('leadsAwaitingUpdate')
        let userUpdateObj = {
          leadsAwaitingUpdate: assignee.leadsAwaitingUpdate,
          $push: {
            newReports: { $each: [ newReport._id ] },
            awaitingUpdateLeads: null,
          },
          $pull: {
            closingLeads: activeLead._id,
          },
        }
        if (activeDiscrepancies > 0 || rejectedDiscrepancies > 0  || preserveLead) {
          userUpdateObj.leadsAwaitingUpdate = userUpdateObj.leadsAwaitingUpdate + 1
          userUpdateObj.$push.awaitingUpdateLeads = { $each: [ leadId ] }
        }
        await assignee.updateOne( userUpdateObj)
      }
    }

    newLead = await ActiveLeadModel.findById(leadId).populate('belongsToMortgage').populate('reports')

    await notifyAssignees(assigneeIds, req.body.userId, newMortgage._id, newLead._id, newTimelineGuid, "leadFinalized", "inactive")

    let newLog = await handleRequestLog('Log', logTime, 'Lead Closed', 'Lead', [{type: 'Report ID', detail: newReport._id}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, assigneeIds, leadId, establishedOutcome, returnMonthlyStat, newMortgage, teamStats, newReport, newTeamClosure, updatedTeamClosures, teamClosureIndex, timelineAddition, leadTier, newTierClosures, newQuarterBreakdown, newParameterStats, newLead, activeDiscrepancies, returnMemberMonthlyStats, preserveLead, assigneeUpdateObjs}, 'lead status change successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Finalize Lead', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { setStatusFinalized }