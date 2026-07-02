const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    dateDeleted: {
      type: String
    },
    belongsToLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    },
    belongsToMortgage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mortgage"
    },
    status: {
      type: String
    },
    type: { //dismissed, finalized
      type: String
    },
    outcome: {
      type: String
    },
    dateGenerated: {
      type: String
    },
    dateGeneratedFileLabel: {
      type: String
    },
    Owner1FullName: {
      type: String,
      default: null,
    },
    Owner2FullName: {
      type: String,
      default: null,
    },
    PreviousOwner1FullName: {
      type: String,
      default: null,
    },
    PreviousOwner2FullName: {
      type: String,
      default: null,
    },
    originalOriginationDate: {
      type: String
    },
    originalEndDate: {
      type: String
    },
    originalLoanAmount: {
      type: Number
    },
    originalInterestRate: {
      type: Number
    },
    originalInterestDue: {
      type: Number
    },
    originalMonthlyPayments: {
      type: Number
    },
    tier: {
      type: Number
    },
    discrepancies: {
      activeCount: {
        type: Number
      },
      inactiveCount: {
        type: Number
      },
      tier1: {
        type: Object,
      },
      tier2: {
        type: Object,
      },
      tier3: {
        type: Object,
      },
    },
    assignees: [{ //Full names
      type: String
    }],
    remainingTermAtClosing: {
      type: String
    },
    principalPaidAtClosing: {
      type: Number
    },
    interestPaidAtClosing: {
      type: Number
    },
    principalRemainingAtClosing: {
      type: Number
    },
    interestRemainingAtClosing: {
      type: Number
    },
    remainingTermAtDismissal: {
      type: String
    },
    principalPaidAtDismissal: {
      type: Number
    },
    interestPaidAtDismissal: {
      type: Number
    },
    principalRemainingAtDismissal: {
      type: Number
    },
    interestRemainingAtDismissal: {
      type: Number
    },
    streetAddress: {
      type: String
    },
    City: {
      type: String
    },
    StateOrProvince: {
      type: String
    },
    PostalCode: {
      type: String
    },
    timeline: [{
      type: Object
    }],
    //* New Mortgage
    newLoanAmount: {
      type: Number
    },
    newInterestRate: {
      type: Number
    },
    newInterestDue: {
      type: Number
    },
    newMonthlyPayments: {
      type: Number
    },
    newTotalDue: {
      type: Number
    },
    newStartDate: {
      type: String
    },
    newEndDate: {
      type: String
    },
    updates: [{
      type: Object
    }],
    //*
    //* Refinances
    //*
    profitAmount: {
      type: Number
    },
    profitPercent: {
      type: Number
    },
    teamTotalProfitAmount: {
      type: Number
    },
    teamTotalProfitPercent: {
      type: Number
    },
    notifyUser: {
      type: Boolean,
      default: false,
    },
    awaitingUpdate: {
      type: Boolean,
      default: false,
    },
  }
);

ReportSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Report', ReportSchema);
