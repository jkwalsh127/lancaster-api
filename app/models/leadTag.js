const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const leadTagSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String
    },
    apiMapping: { // assessment, transfer, distress, subdivision, rezoning, improvements, addSubUnits, taxExemptionStatus
      type: String
    },
    origin: { // default, custom
      type: String,
    },
    description: {
      type: String
    },
    discrepancyFields: [{
      type: String,
    }],
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
    }
  }
);

leadTagSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('LeadTag', leadTagSchema);
