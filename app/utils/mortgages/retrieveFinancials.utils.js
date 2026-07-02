const moment = require('moment')

const retrieveFinancials = async function (originationDate, originalLoanAmount, originalInterestRate, mortgageTerm, targetInterestRate, mortgagePayments) {
  
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

module.exports = { retrieveFinancials }