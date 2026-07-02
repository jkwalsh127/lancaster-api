const moment = require('moment')
const PortfolioMonthlyStatsModel = require('../../models/portfolioMonthlyStats');
const { establishMonthlyStatSession } = require('../monthlyStats.utils')

const updateFinancials = async function (originationDate, originalLoanAmount, originalInterestRate, mortgageTerm, targetInterestRate, mortgagePayments, paymentYear, paymentMonth, paymentAmount, assessedPropertyValue, teamId) {
  
  let monthlyInterestRate = ((originalInterestRate/12)/100)
  let monthlyPayments = (Math.round(((originalLoanAmount*(monthlyInterestRate*((1+monthlyInterestRate)**(mortgageTerm*12))))/(((1+monthlyInterestRate)**(mortgageTerm*12))-1))*10000)/10000)
  let originalTotalDue = (Math.round(((monthlyPayments * (mortgageTerm) * 12))*10000)/10000)
  let originalInterestDue = (Math.round(((originalTotalDue - originalLoanAmount))*10000)/10000)
  let monthlyPayment = (Math.round((monthlyPayments)*10000)/10000)
  let interestRemaining = originalInterestDue
  let originalPrincipalDue = originalLoanAmount
  let principalRemaining = originalPrincipalDue
  let monthlyInterest = 0
  let principalPaid = 0
  let interestPaid = 0
  let payments = []
  let newPortfolioStats = []
  let newPaymentDate = originationDate
  for (let i = 0; i < mortgagePayments.length; i++) {
    let continueParsing = true
    let earlyPayment = 0
    if (paymentYear && (paymentMonth || paymentMonth === 0) && paymentAmount) {
      let thisPaymentDate = moment(mortgagePayments[i].paymentDate, 'MMM Do, YYYY')
      let thisPaymentYear = moment(thisPaymentDate).year()
      if (thisPaymentYear === paymentYear) {
        let thisPaymentMonth = moment(thisPaymentDate).month()
        if (thisPaymentMonth === paymentMonth) {
          earlyPayment = paymentAmount
          continueParsing = false
          newPaymentDate = moment(newPaymentDate).add(1, 'months')
          let paymentDateLabel = newPaymentDate.format('MMM Do, YYYY')
          monthlyInterest = (Math.round((((originalInterestRate/12)/100)*principalRemaining)*10000)/10000)
          interestPaid = interestPaid + monthlyInterest
          principalPaid = principalPaid + (monthlyPayment - monthlyInterest) + mortgagePayments[i].principalPayments + paymentAmount
          principalRemaining = principalRemaining - (monthlyPayment - monthlyInterest) - mortgagePayments[i].principalPayments - paymentAmount
          interestRemaining = interestRemaining - monthlyInterest
          payments.push({
            paymentDate: paymentDateLabel,
            interestPaid: (Math.round((monthlyInterest)*10000)/10000),
            principalPaid: (Math.round(((monthlyPayment - monthlyInterest) + mortgagePayments[i].principalPayments + paymentAmount)*10000)/10000),
            totalInterestPaid: (Math.round((interestPaid)*10000)/10000),
            interestRemaining: (Math.round((interestRemaining)*10000)/10000),
            totalPrincipalPaid: (Math.round((principalPaid)*10000)/10000),
            principalRemaining: (Math.round((principalRemaining)*10000)/10000),
            principalPayments: mortgagePayments[i].principalPayments + paymentAmount,
          })
        }
      }
    }
    if (continueParsing) {
      newPaymentDate = moment(newPaymentDate).add(1, 'months')
      let paymentDateLabel = newPaymentDate.format('MMM Do, YYYY')
      monthlyInterest = (Math.round((((originalInterestRate/12)/100)*principalRemaining)*10000)/10000)
      interestPaid = interestPaid + monthlyInterest
      principalPaid = principalPaid + (monthlyPayment - monthlyInterest) + mortgagePayments[i].principalPayments
      principalRemaining = principalRemaining - (monthlyPayment - monthlyInterest) - mortgagePayments[i].principalPayments
      interestRemaining = interestRemaining - monthlyInterest
      payments.push({
        paymentDate: paymentDateLabel,
        interestPaid: (Math.round((monthlyInterest)*10000)/10000),
        principalPaid: (Math.round(((monthlyPayment - monthlyInterest) + mortgagePayments[i].principalPayments)*10000)/10000),
        totalInterestPaid: (Math.round((interestPaid)*10000)/10000),
        interestRemaining: (Math.round((interestRemaining)*10000)/10000),
        totalPrincipalPaid: (Math.round((principalPaid)*10000)/10000),
        principalRemaining: (Math.round((principalRemaining)*10000)/10000),
        principalPayments: mortgagePayments[i].principalPayments,
      })
    }

    //* Record Portfolio Stat
    let newPaymentMonth = moment(newPaymentDate).month()
    let monthlyStatSession = await establishMonthlyStatSession(newPaymentMonth, moment(newPaymentDate))
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
            totalPrincipalRemaining: ((Math.round((principalRemaining)*10000)/10000) - mortgagePayments[i].principalRemaining ),
            totalInterestRemaining: ((Math.round((interestRemaining)*10000)/10000) - mortgagePayments[i].interestRemaining ),
            totalPaymentsReceived: (Math.round((monthlyInterest + (monthlyPayment - monthlyInterest) + mortgagePayments[i].principalPayments + earlyPayment - (mortgagePayments[i].interestPaid + mortgagePayments[i].principalPaid))*10000)/10000),
            totalInterestReceived: ((Math.round((monthlyInterest)*10000)/10000) - mortgagePayments[i].interestPaid),
            totalEarlyPayments: earlyPayment,
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
        sessionLabelFull: moment(newPaymentDate).format('MMM YYYY'),
        monthNo: newPaymentMonth,
        quarter: monthlyStatSession.quarter,
        quarterSession: monthlyStatSession.quarterSession,
        numberOfMortgages: 1,
        totalOriginalLoanAmount: originalPrincipalDue,
        totalOriginalInterest: originalInterestDue,
        totalAssessedPropertyValue: assessedPropertyValue,
        totalPrincipalRemaining: (Math.round((principalRemaining)*10000)/10000),
        totalInterestRemaining: (Math.round((interestRemaining)*10000)/10000),
        totalPaymentsReceived: (Math.round((monthlyInterest + ((monthlyPayment - monthlyInterest + earlyPayment)))*10000)/10000),
        totalInterestReceived: (Math.round((monthlyInterest)*10000)/10000),
        totalEarlyPayments: earlyPayment,
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
  }

  return returnObj
}

module.exports = { updateFinancials }