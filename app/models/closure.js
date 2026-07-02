const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const ClosureSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    outcome: {
      type: String
    },
    closedMortgage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mortgage'
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
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
    PostalCodePlus4: {
      type: String
    },
    assigneeNames: [{
        type: String
    }],
    closeDate: {
      type: String
    },
    closeDateLabel: {
      type: String
    },
    originalOriginationDate: {
        type: String
    },
    originalEndDate: {
        type: String
    },
    newOriginationDate: {
      type: String
    },
    newEndDate: {
      type: String
    },
    originalInterestRate: {
      type: Number
    },
    originalPrincipalDue: {
      type: Number
    },
    originalInterestDue: {
      type: Number
    },
    updates: [{
      type: Object
    }],
    teamTotalProfitAmount: {
      type: Number
    },
    teamTotalProfitPercent: {
      type: Number
    },
    dateParsed: {
      type: Number
    },
    //* refinance
    profitAmount: {
      type: Number
    },
    profitPercent: {
      type: Number
    },
    remainingTerm: {
      type: String
    },
    remainingPrincipal: {
      type: Number
    },
    remainingInterest: {
      type: Number
    },
    newPrincipal: {
      type: Number
    },
    newInterestRate: {
      type: Number
    },
    newInterestDue: {
      type: Number
    },
  }
);

ClosureSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Closure', ClosureSchema);
