const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const queryPerformanceStatsSchema = new mongoose.Schema(
  {
    date: {
      type: String
    },
    selection: { // all, limited
      type: String,
    },
    errored: {
      type: Boolean,
      default: false,
    },
    monthlyQueriesExhausted: {
      type: Boolean,
      default: false,
    },
    totalQueried: {
      type: Number
    },
    totalSuccessfulQueries: {
      type: Number
    },
    totalFailedQueries: {
      type: Number
    },
    propMixSuccessfulQueries: {
      type: Number
    },
    propMixLessThanLast: {
      type: Boolean,
    },
    propMixGreaterThanLast: {
      type: Boolean,
    },
    attomSuccessfulQueries: {
      type: Number
    },
    attomLessThanLast: {
      type: Boolean,
    },
    attomGreaterThanLast: {
      type: Boolean,
    },
    clCurrentMortgageSuccessfulQueries: {
      type: Number
    },
    clCurrentMortgageLessThanLast: {
      type: Boolean,
    },
    clCurrentMortgageGreaterThanLast: {
      type: Boolean,
    },
    totalInactive: {
      type: Number
    },
    totalDiscrepancies: {
      type: Number
    },
    totalTier1Discrepancies: {
      type: Number
    },
    totalTier2Discrepancies: {
      type: Number
    },
    totalTier3Discrepancies: {
      type: Number
    },
    totalNewLeads: {
      type: Number
    },
    tier1New: {
      type: Number
    },
    tier2New: {
      type: Number
    },
    totalUpdatedLeads: {
      type: Number
    },
    tier1Updated: {
      type: Number
    },
    tier2Updated: {
      type: Number
    },
    tier2Upgraded: {
      type: Number
    },
    leadsWithUpgradedTiers: {
      type: Number
    },
    attomNotFound: [{
      type: Object
    }],
    propMixNotFound: [{
      type: Object
    }],
    clCurrentMortgageNotFound: [{
      type: Object
    }],
    completeNotFound: [{
      type: Object
    }],
    attomMissingRecords: [{
      type: Object
    }],
    propMixMissingRecords: [{
      type: Object
    }],
    clCurrentMortgageMissingRecords: [{
      type: Object
    }],
    completeMissingRecords: [{
      type: Object
    }],
    formattingErrors: [{
      type: Object
    }],
    improperQueries: [{
      type: Object
    }],
    brokenConnections: [{
      type: Object
    }],
  }
);

queryPerformanceStatsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('QueryPerformanceStats', queryPerformanceStatsSchema);
