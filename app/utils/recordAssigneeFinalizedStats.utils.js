const moment = require('moment')
const UserModel = require('../models/user');
const MemberMonthlyStatsModel = require('../models/memberMonthlyStats');
const { establishMonthlyStatSession } = require('./monthlyStats.utils');

exports.recordAssigneeFinalizedStats = async function (assigneeIds, leadId, newReportId, activeDiscrepancies, establishedOutcome, profitNumber, profitPercent, sessionParsed, preserveLead, verifyLead) {

  let quarter = ''
  let sessionStr = ''
  let todaysDate = moment(new Date())
  let thisMonthNo = 0
  let sessionLabel = ''
  let quarterSession = ''
  let sessionLabelFull = ''
  let assigneeUpdateObjs = []
  let returnMemberMonthlyStats = []
  for (let i = 0; i < assigneeIds.length; i++) {
    let assigneeUpdateObj = {}
    let assignee = await UserModel.findById(assigneeIds[i]).populate('memberMonthlyStats').select('lastRefinance lastRenegotiation grossProfitNumber grossProfitPercent closedRefinances closedRenegotiations memberMonthlyStats refinanceFrequency renegotiationFrequency leadsAwaitingUpdate leadsAwaitingVerification awaitingUpdateLeads')
    
    let userUpdateObj = {
      belongsToUser: assignee._id.toString(),
      lastRefinance: assignee.lastRefinance,
      refinanceFrequency: assignee.refinanceFrequency,
      closedRefinances: assignee.closedRefinances,
      grossProfitNumber: assignee.grossProfitNumber,
      grossProfitPercent: assignee.grossProfitPercent,
      lastRenegotiation: assignee.lastRenegotiation,
      renegotiationFrequency: assignee.renegotiationFrequency,
      closedRenegotiations: assignee.closedRenegotiations,
      leadsAwaitingUpdate: assignee.leadsAwaitingUpdate,
      leadsAwaitingVerification: assignee.leadsAwaitingVerification,
      $push: {
        memberMonthlyStats: null,
        newReports: null,
      },
      $pull: {
        closingLeads: null,
      },
    }
    let monthlyStatUser = await MemberMonthlyStatsModel.findById(assignee.memberMonthlyStats[0]).select("sessionParsed leadsDismissed");
    if (monthlyStatUser && monthlyStatUser.sessionParsed === sessionParsed) {
      if (establishedOutcome === 'refinance') {
        monthlyStatUser = await MemberMonthlyStatsModel.findByIdAndUpdate((monthlyStatUser._id), {
          $inc: { 
            closedRefinances: 1,
            grossProfitNumber: profitNumber,
            grossProfitPercent: profitPercent,
          }
        }, {new: true})
      } else {
        monthlyStatUser = await MemberMonthlyStatsModel.findByIdAndUpdate((monthlyStatUser._id), {
          $inc: { 
            closedRenegotiations: 1,
            totalCompleted: 1,
          }
        }, {new: true})
      }
    } else {
      if (quarter.length === 0) {
        thisMonthNo = moment(todaysDate).month()
        sessionLabelFull = moment(todaysDate).format('MMM YYYY')
        let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
        quarter = monthlyStatSession.quarter
        sessionStr = monthlyStatSession.sessionStr
        sessionLabel = monthlyStatSession.sessionLabel
        quarterSession = monthlyStatSession.quarterSession
      }
      let newMonthlyStat = {}
      if (establishedOutcome === 'refinance') {
        newMonthlyStat = new MemberMonthlyStatsModel({
          belongsToUser: assignee._id,
          sessionParsed: sessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: thisMonthNo,
          quarter: quarter,
          quarterSession: quarterSession,
          totalCompleted: 1,
          closedRefinances: 1,
          grossProfitNumber: profitNumber,
          grossProfitPercent: profitPercent,
        })
      } else {
        newMonthlyStat = new MemberMonthlyStatsModel({
          belongsToUser: assignee._id,
          sessionParsed: sessionParsed,
          sessionStr: sessionStr,
          sessionLabel: sessionLabel,
          sessionLabelFull: sessionLabelFull,
          monthNo: thisMonthNo,
          quarter: quarter,
          quarterSession: quarterSession,
          totalCompleted: 1,
          closedRenegotiations: 1,
        })
      }
      await newMonthlyStat.save()
      monthlyStatUser = await MemberMonthlyStatsModel.findById(newMonthlyStat._id)
      userUpdateObj.$push.memberMonthlyStats = {
        $each: [ newMonthlyStat._id ],
        $position: 0
      }
    }
    returnMemberMonthlyStats.push(monthlyStatUser)

    if (establishedOutcome === 'refinance') {
      let frequencyDiff = 0
      if (assignee.lastRefinance) {
        frequencyDiff = moment(todaysDate).diff(assignee.lastRefinance, 'days')
        if (frequencyDiff < 0) {
          frequencyDiff = frequencyDiff * -1
        } else if (isNaN(frequencyDiff)) {
          frequencyDiff = 0
        }
      }
      let newFrequency = (Math.round((frequencyDiff/(assignee.closedRefinances + 1))*10)/10)
      userUpdateObj.lastRefinance = todaysDate
      userUpdateObj.refinanceFrequency = newFrequency
      userUpdateObj.closedRefinances++
      userUpdateObj.grossProfitNumber = userUpdateObj.grossProfitNumber + profitNumber
      userUpdateObj.grossProfitPercent = userUpdateObj.grossProfitPercent + profitPercent
    } else {
      let frequencyDiff = 0
      if (assignee.lastRenegotiation) {
        frequencyDiff = moment(todaysDate).diff(assignee.lastRenegotiation, 'days')
        if (frequencyDiff < 0) {
          frequencyDiff = frequencyDiff * -1
        } else if (isNaN(frequencyDiff)) {
          frequencyDiff = 0
        }
      }
      let newFrequency = (Math.round((frequencyDiff/(assignee.closedRenegotiations + 1))*10)/10)
      userUpdateObj.lastRenegotiation = todaysDate
      userUpdateObj.renegotiationFrequency = newFrequency
      userUpdateObj.closedRenegotiations++
    }
    if (activeDiscrepancies > 0 || preserveLead) {
      userUpdateObj.leadsAwaitingUpdate++
      userUpdateObj.$push.awaitingUpdateLeads = { 
        $each: [ leadId ],
        $position: 0
      }
    } else if (verifyLead) {
      userUpdateObj.leadsAwaitingVerification--
      userUpdateObj.$pull.awaitingUpdateLeads = leadId
    } else {
      userUpdateObj.leadsAwaitingUpdate--
      userUpdateObj.$pull.awaitingUpdateLeads = leadId
    }
    userUpdateObj.$push.newReports = { 
      $each: [ newReportId ],
      $position: 0
    }
    userUpdateObj.$pull.closingLeads = leadId

    await assignee.updateOne(userUpdateObj)
    assigneeUpdateObj.belongsToUser = assignee._id.toString()
    assigneeUpdateObj.closedRenegotiations = userUpdateObj.closedRenegotiations
    assigneeUpdateObj.renegotiationFrequency = userUpdateObj.renegotiationFrequency
    assigneeUpdateObj.closedRefinances = userUpdateObj.closedRefinances
    assigneeUpdateObj.refinanceFrequency = userUpdateObj.refinanceFrequency
    assigneeUpdateObj.grossProfitNumber = userUpdateObj.grossProfitNumber
    assigneeUpdateObj.grossProfitPercent = userUpdateObj.grossProfitPercent
    assigneeUpdateObj.leadsAwaitingVerification = userUpdateObj.leadsAwaitingVerification
    assigneeUpdateObj.leadsAwaitingUpdate = userUpdateObj.leadsAwaitingUpdate
    assigneeUpdateObjs.push(assigneeUpdateObj)
  }
  return {returnMemberMonthlyStats, assigneeUpdateObjs}
}

