const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const MemberMonthlyStatsSchema = new mongoose.Schema({
  belongsToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
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
  totalCompleted: {
    type: Number,
    default: 0,
  },
  //* DISMISS
  leadsDismissed: {
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
  //*
  //* REFINANCES CLOSURE
  //*
  closedRefinances: {
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
});

MemberMonthlyStatsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("MemberMonthlyStats", MemberMonthlyStatsSchema);