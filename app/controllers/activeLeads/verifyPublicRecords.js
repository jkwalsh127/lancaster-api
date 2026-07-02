const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid')
const ReportModel = require('../../models/report');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { formatDates } = require('../../utils/formatDates.utils');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { updateFinancials } = require('../../utils/mortgages/updateFinancials.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { monthlyStatsDates } = require('../../utils/dates.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats');
const { retrieveFinancials } = require('../../utils/mortgages/retrieveFinancials.utils');
const { recordAssigneeFinalizedStats } = require('../../utils/recordAssigneeFinalizedStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function verifyPublicRecords(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Verifying a mortgage's Public Records")
    console.info(`*** mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let newLead = {}
    let newReport = {}
    let teamStats = {}
    let assigneeUpdateObjs = []
    let returnMemberMonthlyStats = []
    let leadId = req.body.leadId
    let teamId = req.body.teamId
    let mortgageId = req.body.mortgageId
    let todaysDateParsed = Date.parse(todaysDate)
    let todaysDateLabel = todaysDate.format('MMM Do, YYYY')
    let todaysDateFileLabel = todaysDate.format("MMM-Do-YYYY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let dates = monthlyStatsDates(todaysDate)
    let todaysDateISO = todaysDate.toISOString()
    let sessionStr = todaysDateISO.substring(0,7)
    let sessionStrToParse = moment(sessionStr)
    let sessionParsed = Date.parse(sessionStrToParse)

    let activeLead = await ActiveLeadModel.findById(leadId)
    let assigneeIds = activeLead.assigneeIds
    let targetOutcome = activeLead.targetOutcome
    let leadTier = activeLead.tier

    let newTimelineGuid = nanoid()
    let timelineAddition = {
      guid: newTimelineGuid,
      date: todaysDateLabel,
      contributor: req.body.userFullName,
      targetOutcome: targetOutcome,
      milestone: 'Public Records Verified',
      details: req.body.updatedFields,
      notify: false
    }

    let newLeadTimeline = activeLead.timeline
    for (let i = newLeadTimeline.length; i > 0; i--) {
      if (newLeadTimeline[(i-1)].milestone.includes('Finalized')) {
        newLeadTimeline[(i-1)].awaitingUpdate = false
        break
      }
    }
    newLeadTimeline.push(timelineAddition)

    // let oldMortgage = {}
    // if (req.body.updatedMortgageData) {
      // oldMortgage = req.body.updatedMortgageData
    // } else {
      let oldMortgage = await MortgageModel.findById(mortgageId)
    // }

    let newMortgageTimeline = oldMortgage.timeline
    for (let i = newMortgageTimeline.length; i > 0; i--) {
      if (newMortgageTimeline[(i-1)].milestone.includes('Finalized')) {
        newMortgageTimeline[(i-1)].awaitingUpdate = false
        break
      }
    }
    newMortgageTimeline.push(timelineAddition)


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

    let oldFinancials = null
    let newTargetProfitNumber = 0
    let newTargetProfitPercent = 0
    let newMonthlyPayments = 0
    let newInterestDue = 0
    let newLoanAmount = 0
    let newPayments = []
    let updatedFields = req.body.updatedFields
    let originalInterestRate = req.body.oldFinancials.originalInterestRate
    let originalLoanAmount = req.body.oldFinancials.originalLoanAmount
    let mortgageTerm = req.body.oldFinancials.mortgageTerm
    let originationDate = req.body.oldFinancials.originationDate
    let originalInterestDue = req.body.oldFinancials.originalInterestDue
    if (!originalInterestDue || isNaN(originalInterestDue)) {
      originalInterestDue = 0
    }
    if (targetOutcome.toUpperCase() === 'RENEGOTIATION') {
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
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].new.length > 0 && activeLead.updates[i].new.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        } else if (match.new.length > 0) {
          reportUpdatedFields.push(match)
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].new.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        } else if (match.old.length > 0) {
          reportUpdatedFields.push(match)
          updatedFields.splice(matchIndex, 1)
        } else if (activeLead.updates[i].old.length > 0) {
          reportUpdatedFields.push(activeLead.updates[i])
          updatedFields.splice(matchIndex, 1)
        }
      } else {
        reportUpdatedFields.push(activeLead.updates[i])
      }
    }
    for (let i = 0; i < updatedFields.length; i++) {
      reportUpdatedFields.push(updatedFields[i])
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
      teamId,
    )
    let originalLoanAmountDifference = 0
    let originalInterestDifference = 0
    let principalRemainingDifference = 0
    let interestRemainingDifference = 0
    if (!req.body.reportGenerated) {
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

    let profitNumberDifference = 0
    let profitPercentDifference = 0
    let reportCreated = false
    let teamAmountFromDate = 0
    let teamPercentFromDate = 0
    let currentTeam = {}
    let oldReport = await ReportModel.findOne({ belongsToLead: req.body.leadId }).select('timeline')
    if (oldReport) {
      if (activeLead.targetOutcome.toUpperCase() === 'REFINANCE') {
        currentTeam = await TeamModel.findById(req.body.teamId).populate('refinanceClosures').select("grossProfitNumber grossProfitPercent refinanceClosures subscription totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining")
      } else {
        currentTeam = await TeamModel.findById(req.body.teamId).select("grossProfitNumber grossProfitPercent subscription totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining") 
      }
    } else {
      currentTeam = await TeamModel.findById(req.body.teamId).select("totalClosures tier1Closures tier2Closures manualClosures closedRefinances tier1Refinances tier2Refinances manualRefinances closedRenegotiations tier1Renegotiations tier2Renegotiations manualRenegotiations grossProfitNumber grossProfitPercent teamMonthlyStats renegotiationClosures refinanceClosures totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining")      
    }
    if (oldReport) {
      let numberNegative = false
      let percentNegative = false
      if (newTargetProfitNumber < 0) {
        newTargetProfitNumber = newTargetProfitNumber*-1
        numberNegative = true
      }
      if (newTargetProfitPercent < 0) {
        newTargetProfitPercent = newTargetProfitPercent*-1
        percentNegative = true
      }
      let currentGrossProfitNumber = currentTeam.grossProfitNumber
      let currentGrossProfitPercent = currentTeam.grossProfitPercent
      profitNumberDifference = newTargetProfitNumber - currentGrossProfitNumber
      profitPercentDifference = newTargetProfitPercent - currentGrossProfitPercent
      let oldTimeline = oldReport.timeline
      let thisMilestone = oldTimeline.find(milestone => milestone.milestone.includes('Finalized'))
      thisMilestone.awaitingUpdate = false
      thisMilestone.newProfits = {
        profitNumber: {
          new: newTargetProfitNumber,
          negative: numberNegative 
        },
        profitPercent: {
          new: newTargetProfitPercent,
          negative: percentNegative
        }
      }, 
      oldTimeline.push(timelineAddition)
      await currentTeam.updateOne({
        grossProfitPercent: currentGrossProfitNumber + profitNumberDifference,
        currentGrossProfitPercent: currentGrossProfitPercent + profitPercentDifference,
      })
      let newReportObj = {
        timeline: oldTimeline,
        updates: activeLead.updates,
        tier: activeLead.tier,
        discrepancies: activeLead.discrepancies,
        assignees: activeLead.assigneeNames,
        streetAddress: oldMortgage.streetAddress,
        City: oldMortgage.recordDetails.address.City.currentValue,
        StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
        PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
        Owner1FullName: oldMortgage.recordDetails.owner1.Owner1FullName.currentValue,
        Owner2FullName: oldMortgage.recordDetails.owner2.Owner2FullName.currentValue,
        originalOriginationDate: oldMortgage.originationDateLabel,
        originalEndDate: oldMortgage.endDateLabel,
        originalInterestDue: oldMortgage.originalInterestDue,
        originalMonthlyPayments: oldMortgage.monthlyPayments,
        remainingTermAtClosing: remainingTerm,
        principalPaidAtClosing: oldFinancials.principalPaid,
        interestPaidAtClosing: oldFinancials.interestPaid,
        principalRemainingAtClosing: oldFinancials.principalRemaining,
        interestRemainingAtClosing: oldFinancials.interestRemaining,
        updates: reportUpdatedFields,
        awaitingUpdate: false,
      }
      if (activeLead.targetOutcome.toUpperCase() === 'REFINANCE') {
        for (let i = 0; i < currentTeam.refinanceClosures.length; i++) {
          if (currentTeam.refinanceClosures[i].dateParsed <= todaysDateParsed) {
            teamAmountFromDate = currentTeam.refinanceClosures[i].teamTotalProfitAmount
            teamPercentFromDate = currentTeam.refinanceClosures[i].teamTotalProfitPercent
            break
          }
        }
        // newReportObj.newEndDate = finalEndDates.formattedDateLabel
        // newReportObj.newOriginationDate = finalOriginationDates.formattedDateLabel
        // newReportObj.newInterestRate = oldMortgage.originalInterestDue
        // newReportObj.profitPercent = newTargetProfitPercent
        // newReportObj.teamTotalProfitAmount = teamAmountFromDate + newTargetProfitNumber
        // newReportObj.teamTotalProfitPercent = teamPercentFromDate + newTargetProfitPercent
        // newReportObj.profitAmount = newTargetProfitNumber
        // newReportObj.newInterestDue = newInterestDue
        // newReportObj.newMonthlyPayments = newMonthlyPayments
        // newReportObj.newLoanAmount = newLoanAmount
        // if (oldMortgage.oldFinancials.originationDate) {
        //   newReportObj.originalOriginationDate = oldMortgage.oldFinancials.originationDate
        // } else {
        //   newReportObj.originalOriginationDate = oldMortgage.originationDate
        // }
        // if (oldMortgage.oldFinancials.endDate) {
        //   newReportObj.originalEndDate = oldMortgage.oldFinancials.endDate
        // } else {
        //   newReportObj.originalEndDate = oldMortgage.endDateLabel
        // }
        // if (oldMortgage.oldFinancials.principal) {
        //   newReportObj.originalLoanAmount = oldMortgage.oldFinancials.principal
        // } else {
        //   newReportObj.originalLoanAmount = oldMortgage.originalLoanAmount
        // }
        // if (oldMortgage.oldFinancials.interestRate) {
        //   newReportObj.originalInterestRate = oldMortgage.oldFinancials.interestRate
        // } else {
        //   newReportObj.originalInterestRate = oldMortgage.originalInterestRate
        // }
        // if (oldMortgage.oldFinancials.interestDue) {
        //   newReportObj.originalInterestDue = oldMortgage.oldFinancials.interestDue
        // } else {
        //   newReportObj.originalInterestDue = oldMortgage.originalInterestDue
        // }
        // if (oldMortgage.oldFinancials.monthlyPayments) {
        //   newReportObj.originalMonthlyPayments = oldMortgage.oldFinancials.monthlyPayments
        // } else {
        //   newReportObj.originalMonthlyPayments = oldMortgage.monthlyPayments
        // }
      }
      newReport = await ReportModel.findByIdAndUpdate((oldReport._id), newReportObj, {new: true})
      newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
        isActive: false,
        status: 'inactive',
        dateDeleted: todaysDate,
        timeline: newLeadTimeline,
      }, {new: true}).populate('reports')
      let verifyLead = !req.body.resolvingRequiredFirst
      let preserveLead = false
      if (currentTeam.subscription[0] === 'enterprise') {
        updateAssigneeStats = await recordAssigneeFinalizedStats(assigneeIds, leadId, newReport._id, 0, targetOutcome, newTargetProfitNumber, newTargetProfitPercent, sessionParsed, preserveLead, verifyLead)
        assigneeUpdateObjs = updateAssigneeStats.assigneeUpdateObjs
        returnMemberMonthlyStats = updateAssigneeStats.returnMemberMonthlyStats
      } else {
        for (let i = 0; i < assigneeIds.length; i++) {
          await UserModel.findByIdAndUpdate((assigneeIds[i]), {
            $pull: { awaitingUpdateLeads: leadId },
            $push: { newReports: { $each: [ newReport._id ] } },
          })
        }
      }
    } else {
      reportCreated = true
      //* Record Monthly Stats
      let statIndex = (currentTeam.teamMonthlyStats.length - 1)
      let existingMonthlyStat = false
      let monthlyStatTeamGrossProfitNumber = newTargetProfitNumber
      let monthlyStatTeamGrossProfitPercent = newTargetProfitPercent
      let monthlyStatGrossProfitNumber = newTargetProfitNumber
      let monthlyStatGrossProfitPercent = newTargetProfitPercent
      for (let i = currentTeam.teamMonthlyStats.length; i > 0; i--) {
        if (targetOutcome === 'renegotiation') {
          teamMonthlyStat = await TeamMonthlyStatsModel.findById(currentTeam.teamMonthlyStats[statIndex]).select("sessionParsed closedRenegotiations manualRenegotiations");
          if (teamMonthlyStat.sessionParsed === sessionParsed) {
            existingMonthlyStat = true
            newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((teamMonthlyStat._id), {
              closedRenegotiations: teamMonthlyStat.closedRenegotiations + 1,
              manualRenegotiations: teamMonthlyStat.manualRenegotiations + 1,
            }, {new: true})
            break
          } else if (teamMonthlyStat.sessionParsed < sessionParsed) {
            break
          }
          if (statIndex !== 0) {
            statIndex--
          }
        } else {
          teamMonthlyStat = await TeamMonthlyStatsModel.findById(currentTeam.teamMonthlyStats[statIndex]).select("grossProfitNumber grossProfitPercent teamGrossProfitNumber teamGrossProfitPercent closedRefinances manualRefinances");
          if (teamMonthlyStat.sessionParsed === sessionParsed) {
            monthlyStatTeamGrossProfitNumber = monthlyStatTeamGrossProfitNumber + teamMonthlyStat.teamGrossProfitNumber
            monthlyStatTeamGrossProfitPercent = monthlyStatTeamGrossProfitPercent + teamMonthlyStat.teamGrossProfitPercent
            monthlyStatGrossProfitNumber = monthlyStatGrossProfitNumber + teamMonthlyStat.grossProfitNumber
            monthlyStatGrossProfitPercent = monthlyStatGrossProfitPercent + teamMonthlyStat.grossProfitPercent
            tierClosuresValue = teamMonthlyStat.manualRefinances + 1
            existingMonthlyStat = true
            newMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((teamMonthlyStat._id), {
              closedRefinances: teamMonthlyStat.closedRefinances + 1,
              manualRefinances: teamMonthlyStat.manualRefinances + 1,
              grossProfitNumber: monthlyStatGrossProfitNumber,
              grossProfitPercent: monthlyStatGrossProfitPercent,
              teamGrossProfitNumber: monthlyStatTeamGrossProfitNumber,
              teamGrossProfitPercent: monthlyStatTeamGrossProfitPercent,
            }, {new: true})
            break
          } else if (teamMonthlyStat.sessionParsed < sessionParsed) {
            break
          }
          if (statIndex !== 0) {
            statIndex--
          }
        }
      }
      if (!existingMonthlyStat) {
        let quarter = ""
        let quarterSession = 0
        let todaysMonthNo = moment(todaysDate).month()
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
        let sessionLabel = ''
        if (todaysDateISO.substring(5,2) === '01') {
          sessionLabel = moment(todaysDate).format('YYYY')
        } else {
          sessionLabel = moment(todaysDate).format('MMM')
        }
        let sessionLabelFull = moment(todaysDate).format('MMM YYYY')
        if (targetOutcome === 'renegotiation') {
          newMonthlyStat = new TeamMonthlyStatsModel({
            belongsToTeam: currentTeam._id,
            sessionParsed: sessionParsed,
            sessionStr: sessionStr,
            sessionLabel: sessionLabel,
            sessionLabelFull: sessionLabelFull,
            monthNo: todaysMonthNo,
            quarter: quarter,
            quarterSession: quarterSession,
            closedRenegotiations: 1,
            manualRenegotiations: 1,
          })
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
            closedRefinances: 1,
            manualRefinances: 1,
            grossProfitNumber: monthlyStatGrossProfitNumber,
            grossProfitPercent: monthlyStatGrossProfitPercent,
            teamGrossProfitNumber: monthlyStatTeamGrossProfitNumber,
            teamGrossProfitPercent: monthlyStatTeamGrossProfitPercent,
          })
        }
        await newMonthlyStat.save()
      }
      //* Create Report
      if (targetOutcome === 'refinance') {
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
      } else {
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
          newInterestRate: req.body.updatedInterestRate,
        })
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
      }
      // newReport = new ReportModel({
      //   belongsToLead: leadId,
      //   belongsToMortgage: oldMortgage._id,
      //   status: 'new',
      //   type: 'finalized',
      //   outcome: 'refinance',
      //   streetAddress: oldMortgage.streetAddress,
      //   City: oldMortgage.recordDetails.address.City.currentValue,
      //   StateOrProvince: oldMortgage.recordDetails.address.StateOrProvince.currentValue,
      //   PostalCode: oldMortgage.recordDetails.address.PostalCode.currentValue,
      //   dateGenerated: todaysDateLabel,
      //   dateGeneratedFileLabel: todaysDateFileLabel,
      //   Owner1FullName: Owner1FullName,
      //   Owner2FullName: Owner2FullName,
      //   tier: activeLead.tier,
      //   discrepancies: activeLead.discrepancies,
      //   assignees: assigneeNames,
      //   remainingTermAtClosing: remainingTerm,
      //   timeline: newTimeline,
      //   newLoanAmount: newFinancials.originalLoanAmount,
      //   newInterestDue: newFinancials.interestRemaining,
      //   newMonthlyPayments: newFinancials.monthlyPayments,
      //   newStartDate: finalOriginationDates.formattedDateLabel,
      //   newEndDate: finalEndDates.formattedDateLabel,
      //   profitAmount: newTargetProfitNumber,
      //   profitPercent: newTargetProfitPercent,
      //   teamTotalProfitAmount: teamAmountFromDate + newTargetProfitNumber,
      //   teamTotalProfitPercent: teamPercentFromDate + newTargetProfitPercent,tedFields,
      //   updates: reportUpdatedFields,
      //   originalOriginationDate: req.body.oldFinancials.originationDate,
      //   originalEndDate: req.body.oldFinancials.endDateLabel,
      //   originalLoanAmount: originalLoanAmount,
      //   originalInterestDue: originalInterestDue,
      //   originalInterestRate: originalInterestRate,
      //   originalMonthlyPayments: req.body.oldFinancials.monthlyPayments,
      //   newInterestRate: req.body.updatedInterestRate,
      // })
      // if (oldFinancials) {
      //   newReport.originalInterestDue = oldFinancials.originalInterestDue
      //   newReport.originalMonthlyPayments = oldFinancials.monthlyPayments
      //   newReport.principalPaidAtClosing = oldFinancials.principalPaid
      //   newReport.interestPaidAtClosing = oldFinancials.interestPaid
      //   newReport.principalRemainingAtClosing = oldFinancials.principalRemaining
      //   newReport.interestRemainingAtClosing = oldFinancials.interestRemaining
      // }
      
      // if (targetOutcome === 'renegotiation') {
      //   newReport.outcome = 'renegotiation'
      // } else {
      //   for (let i = 0; i < currentTeam.refinanceClosures.length; i++) {
      //     if (currentTeam.refinanceClosures[i].dateParsed <= todaysDateParsed) {
      //       teamAmountFromDate = currentTeam.refinanceClosures[i].teamTotalProfitAmount
      //       teamPercentFromDate = currentTeam.refinanceClosures[i].teamTotalProfitPercent
      //       teamClosureIndex = i
      //       break
      //     } else if (i === (currentTeam.refinanceClosures.length - 1)) {
      //       teamClosureIndex = (i + 1)
      //     }
      //     if (i === 0) {
      //       teamLastClosureDate = currentTeam.refinanceClosures[i].closeDateLabel
      //     }
      //   }
      //   newReport.outcome = 'refinance'
      //   newReport.newEndDate = finalEndDates.formattedDateLabel
      //   newReport.newOriginationDate = finalOriginationDates.formattedDateLabel
      //   newReport.newInterestRate = req.body.updatedInterestRate
      //   newReport.profitPercent = newTargetProfitPercent
      //   newReport.teamTotalProfitAmount = teamAmountFromDate + newTargetProfitNumber
      //   newReport.teamTotalProfitPercent = teamPercentFromDate + newTargetProfitPercent
      //   newReport.profitAmount = newTargetProfitNumber
      //   newReport.newInterestDue = newInterestDue
      //   newReport.newMonthlyPayments = newMonthlyPayments
      //   newReport.newLoanAmount = newLoanAmount
      //   if (oldMortgage && oldMortgage.oldFinancials && oldMortgage.oldFinancials.originationDate) {
      //     newReport.originalOriginationDate = oldMortgage.oldFinancials.originationDate
      //   } else {
      //     newReport.originalOriginationDate = oldMortgage.originationDate
      //   }
      //   if (oldMortgage && oldMortgage.oldFinancials && oldMortgage.oldFinancials.endDate) {
      //     newReport.originalEndDate = oldMortgage.oldFinancials.endDate
      //   } else {
      //     newReport.originalEndDate = oldMortgage.endDateLabel
      //   }
      //   if (oldMortgage && oldMortgage.oldFinancials && oldMortgage.oldFinancials.principal) {
      //     newReport.originalLoanAmount = oldMortgage.oldFinancials.principal
      //   } else {
      //     newReport.originalLoanAmount = oldMortgage.originalLoanAmount
      //   }
      //   if (oldMortgage && oldMortgage.oldFinancials && oldMortgage.oldFinancials.interestRate) {
      //     newReport.originalInterestRate = oldMortgage.oldFinancials.interestRate
      //   } else {
      //     newReport.originalInterestRate = oldMortgage.originalInterestRate
      //   }
      //   if (oldMortgage && oldMortgage.oldFinancials && oldMortgage.oldFinancials.interestDue) {
      //     newReport.originalInterestDue = oldMortgage.oldFinancials.interestDue
      //   } else {
      //     newReport.originalInterestDue = oldMortgage.originalInterestDue
      //   }
      //   if (oldMortgage && oldMortgage.oldFinancials && ldMortgage.oldFinancials.monthlyPayments) {
      //     newReport.originalMonthlyPayments = oldMortgage.oldFinancials.monthlyPayments
      //   } else {
      //     newReport.originalMonthlyPayments = oldMortgage.monthlyPayments
      //   }
      // }
      // await newReport.save()
      //* Update Team Stats
      let newFrequency = 0
      let frequencyDiff = 0
      let newFrequencyField = ''
      let teamLastClosureDate = todaysDateLabel
      let newLastClosureField = ''
      let newManualClosedField = ''
      let newManualClosedCount = 0
      let newClosedField = ''
      let newClosedCount = 0
      if (targetOutcome === 'renegotiation') {
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
        //* Calculate Renegotiation Frequency
        newFrequencyField = 'renegotiationFrequency'
        if (currentTeam.renegotiationClosures.length > 0) {
          if ((Date.parse(currentTeam.renegotiationClosures[(currentTeam.renegotiationClosures.length - 1)].closeDate) > Date.parse(todaysDate))) {
            frequencyDiff = moment(todaysDate).diff(moment(todaysDate), 'days')
          } else {
            let closeDateISO = moment(new Date(currentTeam.renegotiationClosures[(currentTeam.renegotiationClosures.length - 1)].closeDate))
            frequencyDiff = moment(todaysDate).diff(closeDateISO, 'days')
          }
        } else {
          frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
        }
        if (frequencyDiff < 0) {
          frequencyDiff = frequencyDiff * -1
        }
        newFrequency = (Math.round((frequencyDiff/(currentTeam.closedRenegotiations + 1))*10)/10)
        if (isNaN(newFrequency) || newFrequency === 0) {
          newFrequency = 0
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
        }
        newManualClosedField = 'manualRenegotiations'
        newManualClosedCount = currentTeam.manualRenegotiations + 1
        newClosedField = 'closedRenegotiations'
        newClosedCount = currentTeam.closedRenegotiations + 1
        //* Retrieve Last Renegotiation Closure
        newLastClosureField = 'lastRenegotiation'
        for (let i = 0; i < currentTeam.renegotiationClosures.length; i++) {
          if (i === 0) {
            teamLastClosureDate = currentTeam.renegotiationClosures[i].closeDateLabel
          }
        }
      } else {
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
        //* Calculate Refinance Frequency
        newFrequencyField = 'refinanceFrequency'
        if (currentTeam.refinanceClosures.length > 0) {
          if ((Date.parse(currentTeam.refinanceClosures[(currentTeam.refinanceClosures.length - 1)].closeDate) > Date.parse(todaysDate))) {
            frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
          } else {
            let closeDateISO = new Date((currentTeam.refinanceClosures[(currentTeam.refinanceClosures.length - 1)].closeDate))
            frequencyDiff = moment(todaysDate).diff(closeDateISO, 'days')
          }
        } else {
          frequencyDiff = moment(todaysDate).diff(todaysDate, 'days')
        }
        if (frequencyDiff < 0) {
          frequencyDiff = frequencyDiff * -1
        }
        newFrequency = (Math.round((frequencyDiff/(currentTeam.closedRefinances + 1))*10)/10)
        if (isNaN(newFrequency) || newFrequency === 0) {
          newFrequency = 0
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
          averageProfitNumber: newAverageProfitNumber,
          averageProfitPercent: newaverageProfitPercent,
          totalClosures: currentTeam.totalClosures + 1,
          closedRenegotiations: currentTeam.closedRenegotiations + 1,
        }
        newManualClosedField = 'manualRefinances'
        newManualClosedCount = currentTeam.manualRefinances + 1
        newClosedField = 'closedRefinances'
        newClosedCount = currentTeam.closedRefinances + 1
        //* Retrieve Refinance Last Closure
        newLastClosureField = 'lastRefinance'
        for (let i = 0; i < currentTeam.renegotiationClosures.length; i++) {
          if (i === 0) {
            teamLastClosureDate = currentTeam.renegotiationClosures[i].closeDateLabel
          }
        }
      }
      if (existingMonthlyStat) {
        await currentTeam.updateOne({
          manualClosures: currentTeam.manualClosures + 1,
          totalClosures: currentTeam.totalClosures + 1,
          [newClosedField]: newClosedCount,
          [newManualClosedField]: newManualClosedCount,
          [newLastClosureField]: teamLastClosureDate,
          [newFrequencyField]: newFrequency,
          $push: {
            reports: {
              $each: [ newReport._id ],
              $position: 0
            },
          },
        })
      } else {
        await currentTeam.updateOne({
          manualClosures: currentTeam.manualClosures + 1,
          totalClosures: currentTeam.totalClosures + 1,
          [newClosedField]: newClosedCount,
          [newManualClosedField]: newManualClosedCount,
          [newLastClosureField]: teamLastClosureDate,
          [newFrequencyField]: newFrequency,
          $push: {
            reports: {
              $each: [ newReport._id ],
              $position: 0
            },
            teamMonthlyStats: {
              $each: [ newMonthlyStat._id ],
              $position: 0
            },
          },
        })
      }
      newLead = await ActiveLeadModel.findByIdAndUpdate((leadId), {
        isActive: false,
        status: 'inactive',
        dateDeleted: todaysDate,
        timeline: newLeadTimeline,
        $push: {
          reports: {
            $each: [ newReport._id ],
            $position: 0
          },
        },
      }, {new: true}).populate('reports')

      let verifyLead = !req.body.resolvingRequiredFirst
      let preserveLead = false
      if (currentTeam.subscription[0] === 'enterprise') {
        updateAssigneeStats = await recordAssigneeFinalizedStats(assigneeIds, leadId, newReport._id, 0, targetOutcome, newTargetProfitNumber, newTargetProfitPercent, sessionParsed, preserveLead, verifyLead)
        assigneeUpdateObjs = updateAssigneeStats.assigneeUpdateObjs
        returnMemberMonthlyStats = updateAssigneeStats.returnMemberMonthlyStats
      } else {
        for (let i = 0; i < assigneeIds.length; i++) {
          await UserModel.findByIdAndUpdate((assigneeIds[i]), {
            $pull: { awaitingUpdateLeads: leadId },
            $push: { newReports: { $each: [ newReport._id ] } },
          })
        }
      }
    }

    await notifyAssignees(assigneeIds, req.body.userId, mortgageId, activeLead._id, newTimelineGuid, "lead", "incative")

    let verifyLead = !req.body.resolvingRequiredFirst
    let teamUpdateObj = {
      $pull: { awaitingUpdateLeads: leadId },
      $inc: { 
        leadsAwaitingVerification: 0,
        leadsAwaitingUpdate: 0,
      }
    }
    let assessmentValueDifference = 0
    if (oldMortgage.recordDetails.assessment.AssessedValue.originalDiscrepancy) {
      assessmentValueDifference = parseFlot(oldMortgage.recordDetails.assessment.AssessedValue.currentValue) - parseFlot(oldMortgage.recordDetails.assessment.AssessedValue.originalValue)
    }
    if (verifyLead) {
      teamUpdateObj.$inc = {
        leadsAwaitingVerification: -1,
        totalOriginalLoanAmount: originalLoanAmountDifference,
        totalOriginalInterest: originalInterestDifference,
        totalPrincipalRemaining: principalRemainingDifference,
        totalInterestRemaining: interestRemainingDifference,
        totalAssessedPropertyValue: assessmentValueDifference,
      }
    } else {
      teamUpdateObj.$inc = {
        leadsAwaitingUpdate: -1,
        totalOriginalLoanAmount: originalLoanAmountDifference,
        totalOriginalInterest: originalInterestDifference,
        totalPrincipalRemaining: principalRemainingDifference,
        totalInterestRemaining: interestRemainingDifference,
        totalAssessedPropertyValue: assessmentValueDifference,
      }
    }

    if (newFinancials.newPortfolioStats.length > 0) {
      teamUpdateObj.$push = {
        portfolioMonthlyStats: {
          $each: newFinancials.newPortfolioStats,
        },
      }
    }

    await TeamModel.findByIdAndUpdate((teamId), teamUpdateObj, { new: true })

    let returnMonthlyStat = {}
    let oldMonthlyStat = await TeamMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("recordsVerified")
    if (oldMonthlyStat) {
      returnMonthlyStat = await TeamMonthlyStatsModel.findByIdAndUpdate((oldMonthlyStat._id), {recordsVerified: oldMonthlyStat.recordsVerified + 1}, { new: true })
    } else {
      let monthlyStat = new TeamMonthlyStatsModel({
        belongsToTeam: teamId,
        sessionParsed: dates.sessionParsed,
        sessionStr: dates.sessionStr,
        sessionLabel: dates.sessionLabel,
        sessionLabelFull: dates.sessionLabelFull,
        monthNo: dates.thisMonthNo,
        quarter: dates.quarter,
        quarterSession: dates.quarterSession,
        recordsVerified: 1,
      })
      await monthlyStat.save()
      returnMonthlyStat = await TeamMonthlyStatsModel.findById(monthlyStat._id)
    }

    let newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), {
      status: 'inactive',
      timeline: newMortgageTimeline,
      activeDiscrepancies: 0,
      resolvedDiscrepancies: 0,
      rejectedDiscrepancies: 0,
      activeLead: null,
      activeLeadTier: null,
      payments: newPayments,
      $push: { 
        reports: {
          $each: [ newReport._id ],
          $position: 0
        },
      }
    }, {new: true}).populate('reports')

    let newLog = await handleRequestLog('Log', logTime, 'Mortgage Public Records Verified', 'Active Leads', [{}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {verifyLead, returnMemberMonthlyStats, leadTier, targetOutcome, teamStats, reportCreated, newReport, leadId, newLog, newMortgage, assigneeIds, returnMonthlyStat, newLead, assigneeUpdateObjs}, 'Mortgage Public Records were verified.');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Verify Public Records', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { verifyPublicRecords }