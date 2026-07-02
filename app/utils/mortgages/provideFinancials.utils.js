const moment = require('moment')
const TeamModel = require('../../models/team')
const PortfolioMonthlyStatsModel = require('../../models/portfolioMonthlyStats')
const { establishMonthlyStatSession } = require('../monthlyStats.utils')

const provideFinancials = async function (originationDate, mortgageTerm, todaysDate, originalLoanAmount, originalInterestRate, mortgageTerm, targetInterestRate, assessedPropertyValue, fromSweep, teamId) {

  let originationDateLabel = ''
  if (originationDate.length !== 13 && originationDate.length !== 14) {
    originationDateLabel = moment(originationDate).format("MMM Do, YYYY")
  } else {
    originationDateLabel = originationDate
  }
  let endDateParsed = moment(originationDateLabel, "MMM Do, YYYY")
  let endDateInt = moment(endDateParsed).add(mortgageTerm, 'years').subtract(1, 'month')
  let endDate = moment(endDateInt).toISOString()
  let endDateLabel = moment(endDateInt).format("MMM Do, YYYY")
  let diffMonths = (endDateInt.diff(todaysDate, 'months')) + 1
  let roundedYears = Math.floor(diffMonths/12)
  let leftoverMonths = diffMonths - (roundedYears * 12)
  let remainingTerm = ''
  let monthsLabel = ''
  if (leftoverMonths === 1) {
    monthsLabel = 'month'
  } else {
    monthsLabel = 'months'
  }
  let yearsLabel = ''
  if (roundedYears === 1) {
    yearsLabel = 'year'
  } else if (roundedYears > 1) {
    yearsLabel = 'years'
  }
  if (roundedYears !== 0) {
    remainingTerm = `${roundedYears} ${yearsLabel} and ${leftoverMonths} ${monthsLabel}`
  } else {
    remainingTerm = `${leftoverMonths} ${monthsLabel}`
  }

  let monthlyInterestRate = ((originalInterestRate/12)/100)
  let monthlyPayments = (Math.round(((originalLoanAmount*(monthlyInterestRate*((1+monthlyInterestRate)**(mortgageTerm*12))))/(((1+monthlyInterestRate)**(mortgageTerm*12))-1))*10000)/10000)
  let originalTotalDue = (Math.round(((monthlyPayments * (mortgageTerm) * 12))*10000)/10000)
  let originalInterestDue = (Math.round(((originalTotalDue - originalLoanAmount))*10000)/10000)
  let monthsPassed = ((mortgageTerm*12) - diffMonths)
  let monthlyPayment = (Math.round((monthlyPayments)*10000)/10000)
  let interestRemaining = originalInterestDue
  let originalPrincipalDue = originalLoanAmount
  let principalRemaining = originalPrincipalDue
  let monthlyInterest = 0
  let principalPaid = 0
  let interestPaid = 0
  let payments = []
  let newPortfolioStats = []
  let paymentDate = originationDate
  for (let j = 0; j < monthsPassed; j++) {
    paymentDate = moment(paymentDate).add(1, 'months')
    let paymentDateLabel = paymentDate.format('MMM Do, YYYY')
    monthlyInterest = (Math.round((((originalInterestRate/12)/100)*principalRemaining)*10000)/10000)
    interestPaid = interestPaid + monthlyInterest
    principalPaid = principalPaid + (monthlyPayment - monthlyInterest)
    principalRemaining = principalRemaining - (monthlyPayment - monthlyInterest)
    interestRemaining = interestRemaining - monthlyInterest
    payments.push({
      paymentDate: paymentDateLabel,
      interestPaid: (Math.round((monthlyInterest)*10000)/10000),
      principalPaid: (Math.round((monthlyPayment - monthlyInterest)*10000)/10000),
      totalInterestPaid: (Math.round((interestPaid)*10000)/10000),
      interestRemaining: (Math.round((interestRemaining)*10000)/10000),
      totalPrincipalPaid: (Math.round((principalPaid)*10000)/10000),
      principalRemaining: (Math.round((principalRemaining)*10000)/10000),
      principalPayments: 0,
    })

    //* Record Portfolio Stat
    let newPaymentMonth = moment(paymentDate).month()
    let monthlyStatSession = await establishMonthlyStatSession(newPaymentMonth, moment(paymentDate))
    let sessionStr = monthlyStatSession.sessionStr
    let sessionStrToParse = moment(monthlyStatSession.sessionStr)
    let sessionParsed = Date.parse(sessionStrToParse)
    
    let newPortfolioStat = null
    let createNewPortfolioStat = true
    let oldPortfolioStat = await PortfolioMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("sessionParsed")
    if (oldPortfolioStat) {
      if (oldPortfolioStat.sessionParsed === sessionParsed) {
        createNewPortfolioStat = false
        updateObj = {
          $inc: {
            numberOfMortgages: 1,
            totalOriginalLoanAmount: originalPrincipalDue,
            totalOriginalInterest: originalInterestDue,
            totalAssessedPropertyValue: assessedPropertyValue,
            totalPrincipalRemaining: (Math.round((principalRemaining)*10000)/10000),
            totalInterestRemaining: (Math.round((interestRemaining)*10000)/10000),
            totalPaymentsReceived: (Math.round((monthlyInterest + (monthlyPayment - monthlyInterest))*10000)/10000),
            totalInterestReceived: (Math.round((monthlyInterest)*10000)/10000),
            totalEarlyPayments: 0,
          }
        }
        newPortfolioStat = await PortfolioMonthlyStatsModel.findByIdAndUpdate((oldPortfolioStat._id), updateObj, { new: true })
      }
    }
    if (createNewPortfolioStat) {
      let portfolioStat = new PortfolioMonthlyStatsModel({
        belongsToTeam: teamId,
        sessionParsed: sessionParsed,
        sessionStr: sessionStr,
        sessionLabel: monthlyStatSession.sessionLabel,
        sessionLabelFull: moment(paymentDate).format('MMM YYYY'),
        monthNo: newPaymentMonth,
        quarter: monthlyStatSession.quarter,
        quarterSession: monthlyStatSession.quarterSession,
        numberOfMortgages: 1,
        totalOriginalLoanAmount: originalPrincipalDue,
        totalOriginalInterest: originalInterestDue,
        totalAssessedPropertyValue: assessedPropertyValue,
        totalPrincipalRemaining: (Math.round((principalRemaining)*10000)/10000),
        totalInterestRemaining: (Math.round((interestRemaining)*10000)/10000),
        totalPaymentsReceived: (Math.round((monthlyInterest + (monthlyPayment - monthlyInterest))*10000)/10000),
        totalInterestReceived: (Math.round((monthlyInterest)*10000)/10000),
        totalEarlyPayments: 0,
      })
      await portfolioStat.save()
      newPortfolioStat = await PortfolioMonthlyStatsModel.findById(portfolioStat._id)
      newPortfolioStats.push(newPortfolioStat._id)
    }
  }

  let targetMonthlyInterestRate = (targetInterestRate/12)/100
  let targetMonthlyPayment = (Math.round(((principalRemaining*(targetMonthlyInterestRate*((1+targetMonthlyInterestRate)**(parseFloat(mortgageTerm)*12))))/(((1+targetMonthlyInterestRate)**(parseFloat(mortgageTerm)*12))-1))*10000)/10000)
  let totalDue = targetMonthlyPayment * (parseFloat(mortgageTerm)*12);
  let targetInterestDue = (Math.round((totalDue-principalRemaining)*10000)/10000);
  let targetProfitNumber = (Math.round((targetInterestDue - interestRemaining)*10000)/10000);
  let targetProfitPercent = (Math.round(((targetInterestDue/interestRemaining)*100)-100)*10000)/10000;

  newPortfolioStats = newPortfolioStats.reverse()
  if (fromSweep) {
    await TeamModel.findByIdAndUpdate((teamId), {
      $push: {
        portfolioMonthlyStats: {
          $each: newPortfolioStats,
        },
      }
    })
  }

  let returnObj = {
    originalLoanAmount: originalLoanAmount,
    originalInterestRate: originalInterestRate,
    monthlyPayments: monthlyPayments,
    originalTotalDue: originalTotalDue,
    originalInterestDue: originalInterestDue,
    principalPaid: Math.round((principalPaid*10000)/10000),
    interestPaid: Math.round((interestPaid*10000)/10000),
    principalRemaining: Math.round((principalRemaining*10000)/10000),
    monthlyInterestRate: monthlyInterestRate,
    interestRemaining: Math.round((interestRemaining*10000)/10000),
    targetMonthlyPayment: targetMonthlyPayment,
    targetProfitNumber: targetProfitNumber,
    targetProfitPercent: targetProfitPercent,
    targetInterestDue: targetInterestDue,
    payments: payments,
    newPortfolioStats: newPortfolioStats,
    //*
    originationDateLabel: originationDateLabel,
    endDate: endDate,
    endDateLabel: endDateLabel,
    diffMonths: diffMonths,
    remainingTerm: remainingTerm,
  }

  return returnObj
}

module.exports = { provideFinancials }