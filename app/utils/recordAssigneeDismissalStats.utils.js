const moment = require('moment')
const UserModel = require('../models/user');
const MemberMonthlyStatsModel = require('../models/memberMonthlyStats');
const { establishMonthlyStatSession } = require('./monthlyStats.utils');

exports.recordAssigneeDismissalStats = async function (assigneeIds, leadId, leadStatus, newReportId, sessionParsed, activeDiscrepancies) {
  let quarter = ''
  let sessionStr = ''
  let todaysDate = ''
  let thisMonthNo = 0
  let sessionLabel = ''
  let quarterSession = ''
  let sessionLabelFull = ''
  let assigneeUpdateObjs = []
  let returnMemberMonthlyStats = []
  for (let i = 0; i < assigneeIds.length; i++) {
    let assigneeUpdateObj = {}
    // let assignee = await UserModel.findById(assigneeIds[i]).populate('memberMonthlyStats').select('lastRefinance lastRenegotiation grossProfitNumber grossProfitPercent closedRefinances closedRenegotiations memberMonthlyStats refinanceFrequency renegotiationFrequency leadsAwaitingUpdate leadsAwaitingVerification')
    let assignee = await UserModel.findById(assigneeIds[i]).populate('memberMonthlyStats').select('leadsAwaitingUpdate leadsAwaitingVerification')


    //* Object to return from this function, provides scaffold for possible updates
    let userUpdateObj = {
      belongsToUser: assignee._id.toString(),
      // lastRefinance: assignee.lastRefinance,
      // refinanceFrequency: assignee.refinanceFrequency,
      // closedRefinances: assignee.closedRefinances,
      // grossProfitNumber: assignee.grossProfitNumber,
      // grossProfitPercent: assignee.grossProfitPercent,
      // lastRenegotiation: assignee.lastRenegotiation,
      // renegotiationFrequency: assignee.renegotiationFrequency,
      // closedRenegotiations: assignee.closedRenegotiations,
      leadsAwaitingUpdate: assignee.leadsAwaitingUpdate,
      leadsAwaitingVerification: assignee.leadsAwaitingVerification,
      $push: {
        memberMonthlyStats: null,
        newReports: null,
      },
      $pull: {
        awaitingActionLeads: null,
        investigatingLeads: null,
        closingLeads: null,
        awaitingUpdateLeads: null,
      },
    }
    let monthlyStatUser = await MemberMonthlyStatsModel.findById(assignee.memberMonthlyStats[0]).select("sessionParsed leadsDismissed");
    //* If Assignee has existing MonthlyStat, update MonthlyStat
    if (monthlyStatUser && monthlyStatUser.sessionParsed === sessionParsed) {
      monthlyStatUser = await MemberMonthlyStatsModel.findByIdAndUpdate((monthlyStatUser._id), {
        $inc: { 
          leadsDismissed: 1,
          totalCompleted: 1,
        }
      }, {new: true})
    //* Else if first action of the month, create new MonthlyStat
    } else {
      if (quarter.length === 0) {
        todaysDate = moment(new Date())
        thisMonthNo = moment(todaysDate).month()
        sessionLabelFull = moment(todaysDate).format('MMM YYYY')
        let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
        quarter = monthlyStatSession.quarter
        sessionStr = monthlyStatSession.sessionStr
        sessionLabel = monthlyStatSession.sessionLabel
        quarterSession = monthlyStatSession.quarterSession
      }
      newMonthlyStat = new MemberMonthlyStatsModel({
        belongsToUser: assignee._id,
        sessionParsed: sessionParsed,
        sessionStr: sessionStr,
        sessionLabel: sessionLabel,
        sessionLabelFull: sessionLabelFull,
        monthNo: thisMonthNo,
        quarter: quarter,
        quarterSession: quarterSession,
        leadsDismissed: 1,
        totalCompleted: 1,
      })
      await newMonthlyStat.save()
      monthlyStatUser = await MemberMonthlyStatsModel.findById(newMonthlyStat._id)
      userUpdateObj.$push.memberMonthlyStats = {
        $each: [ newMonthlyStat._id ],
        $position: 0
      }
    }
    returnMemberMonthlyStats.push(monthlyStatUser)

    //* Pull the lead from list of assignments
    if (leadStatus === 'investigating') {
      userUpdateObj.$pull.investigatingLeads = leadId
    } else if (leadStatus === 'closing') {
      userUpdateObj.$pull.closingLeads = leadId
    } else if (leadStatus === 'awaitingAction') {
      userUpdateObj.$pull.awaitingActionLeads = leadId
    } else if (leadStatus === 'awaitingUpdate' && activeDiscrepancies > 0) {
      userUpdateObj.$pull.awaitingUpdateLeads = leadId
      userUpdateObj.leadsAwaitingUpdate = assignee.leadsAwaitingUpdate - 1
    } else {
      userUpdateObj.$pull.awaitingUpdateLeads = leadId
      userUpdateObj.leadsAwaitingVerification = assignee.leadsAwaitingVerification - 1
    }
    userUpdateObj.$push.newReports = { 
      $each: [ newReportId ],
    }

    await assignee.updateOne(userUpdateObj)

    // assigneeUpdateObj.closedRenegotiations = userUpdateObj.closedRenegotiations
    // assigneeUpdateObj.renegotiationFrequency = userUpdateObj.renegotiationFrequency
    // assigneeUpdateObj.closedRefinances = userUpdateObj.closedRefinances
    // assigneeUpdateObj.refinanceFrequency = userUpdateObj.refinanceFrequency
    // assigneeUpdateObj.grossProfitNumber = userUpdateObj.grossProfitNumber
    // assigneeUpdateObj.grossProfitPercent = userUpdateObj.grossProfitPercent
    assigneeUpdateObj.belongsToUser = assignee._id.toString()
    assigneeUpdateObj.leadsAwaitingVerification = userUpdateObj.leadsAwaitingVerification
    assigneeUpdateObj.leadsAwaitingUpdate = userUpdateObj.leadsAwaitingUpdate
    assigneeUpdateObjs.push(assigneeUpdateObj)
  }
  return {returnMemberMonthlyStats, assigneeUpdateObjs}
}