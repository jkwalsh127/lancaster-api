const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const mortgageTagSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String
    },
    apiMapping: { //quitClaim, loanType, ownerEntityType, ownerIsTrust, distress, secondMortgage, ownerOccupied, propertyType
      type: String
    },
    description: {
      type: String
    },
    currentMortgages: {
      type: Number,
      default: 0,
    },
    currentAssignments: {
      type: Number,
      default: 0,
    },
    activeLeads: {
      type: Number,
      default: 0,
    },
    renegotiations: {
      type: Number,
      default: 0,
    },
    refinances: {
      type: Number,
      default: 0,
    },
    resolutions: {
      type: Number,
      default: 0,
    },
    dismissals: {
      type: Number,
      default: 0,
    },
    discrepancyFields: [{
      type: String
    }],
    origin: { // default, created
      type: String,
    }
  }
);

mortgageTagSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('MortgageTag', mortgageTagSchema);
