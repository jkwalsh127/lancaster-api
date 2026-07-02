const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PortfolioMonthlyStatsSchema = new mongoose.Schema({
  belongsToTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  sessionParsed: {
    type: Number
  },
  sessionStr: {
    type: String
  },
  sessionLabel: {
    type: String
  },
  sessionLabelFull: {
    type: String
  },
  monthNo: {
    type: Number,
    default: 0,
  },
  quarter: {
    type: String
  },
  quarterSession: {
    type: Number,
    default: 0,
  },
  //*
  numberOfMortgages: {
    type: Number,
    default: 0,
  },
  totalOriginalLoanAmount: {
    type: Number,
    default: 0,
  },
  totalOriginalInterest: {
    type: Number,
    default: 0,
  },
  totalAssessedPropertyValue: {
    type: Number,
    default: 0,
  },
  totalPrincipalRemaining: {
    type: Number,
    default: 0,
  },
  totalInterestRemaining: {
    type: Number,
    default: 0,
  },
  totalPaymentsReceived: {
    type: Number,
    default: 0,
  },
  totalInterestReceived: {
    type: Number,
    default: 0,
  },
  totalEarlyPayments: {
    type: Number,
    default: 0,
  },
});

PortfolioMonthlyStatsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("PortfolioMonthlyStats", PortfolioMonthlyStatsSchema);