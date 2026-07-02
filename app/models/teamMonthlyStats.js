const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const TeamMonthlyStatsSchema = new mongoose.Schema({
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
  //* DISMISS
  leadsDismissed: {
    type: Number,
    default: 0,
  },
  //* UPDATED RECORDS
  recordsUpdated: {
    type: Number,
    default: 0,
  },
  //*
  //* RENEGOTIATION CLOSURE
  //*
  closedRenegotiations: {
    type: Number,
    default: 0,
  },
  tier1Renegotiations: {
    type: Number,
    default: 0,
  },
  tier2Renegotiations: {
    type: Number,
    default: 0,
  },
  manualRenegotiations: {
    type: Number,
    default: 0,
  },
  //*
  //* REFINANCES CLOSURE
  //*
  closedRefinances: {
    type: Number,
    default: 0,
  },
  tier1Refinances: {
    type: Number,
    default: 0,
  },
  tier2Refinances: {
    type: Number,
    default: 0,
  },
  manualRefinances: {
    type: Number,
    default: 0,
  },
  grossProfitNumber: {
    type: Number,
    default: 0,
  },
  grossProfitPercent: {
    type: Number,
    default: 0,
  },
  teamGrossProfitNumber: {
    type: Number,
    default: 0,
  },
  teamGrossProfitPercent: {
    type: Number,
    default: 0,
  },
  //*
  //* TRANS PAC QUERY
  //*
  totalQueried: {
    type: Number,
    default: 0,
  },
  successfulQueries: {
    type: Number,
    default: 0,
  },
  failedQueries: {
    type: Number,
    default: 0,
  },
  attomSuccessfulQueries: {
    type: Number,
    default: 0,
  },
  clCurrentMortgageSuccessfulQueries: {
    type: Number,
    default: 0,
  },
  propMixSuccessfulQueries: {
    type: Number,
    default: 0,
  },
  completeMissingRecords: {
    type: Number,
    default: 0,
  },
  propMixMissingRecords: {
    type: Number,
    default: 0,
  },
  attomMissingRecords: {
    type: Number,
    default: 0,
  },
  clCurrentMortgageMissingRecords: {
    type: Number,
    default: 0,
  },
  completeNotFound: {
    type: Number,
    default: 0,
  },
  clCurrentMortgageNotFound: {
    type: Number,
    default: 0,
  },
  propMixNotFound: {
    type: Number,
    default: 0,
  },
  attomNotFound: {
    type: Number,
    default: 0,
  },
  totalNewLeads: {
    type: Number,
    default: 0
  },
  updatedLeads: {
    type: Number,
    default: 0
  },
  totalHits: {
    type: Number,
    default: 0
  },
  totalHitsPercent: {
    type: Number,
    default: 0
  },
  previousTier1: {
    type: Number,
    default: 0,
  },
  previousTier2: {
    type: Number,
    default: 0,
  },
  tier1Updated: {
    type: Number,
    default: 0,
  },
  tier2Updated: {
    type: Number,
    default: 0,
  },
  tier2Upgraded: {
    type: Number,
    default: 0,
  },
  tier1New: {
    type: Number,
    default: 0,
  },
  tier2New: {
    type: Number,
    default: 0,
  },
  totalDiscrepancies: {
    type: Number,
    default: 0,
  },
  //*
  //* Validate Public Records
  //*
  recordsVerified: {
    type: Number,
    default: 0,
  },
});

TeamMonthlyStatsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("TeamMonthlyStats", TeamMonthlyStatsSchema);