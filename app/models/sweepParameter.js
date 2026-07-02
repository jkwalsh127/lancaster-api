const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const sweepParameterSchema = new mongoose.Schema(
  {
    subCategory: {
      type: String
    },
    apiMapping: {
      type: String
    },
    label: {
      type: String
    },
    assignedTier: {
      type: String
    },
    active: {
      type: Boolean
    },
    renegotiations: {
      type: Number,
      default: 0,
    },
    refinances: {
      type: Number,
      default: 0,
    },
    dismissals: {
      type: Number,
      default: 0,
    },
    empty: {
      type: Number,
      default: 0,
    },
    backupOnly: {
      type: Number,
      default: 0,
    },
    noBackup: {
      type: Number,
      default: 0,
    },
    populated: {
      type: Number,
      default: 0,
    },
    totalQueries: {
      type: Number,
      default: 0,
    },
    discrepancies: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
    }],
  }
);

sweepParameterSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('SweepParameter', sweepParameterSchema);
