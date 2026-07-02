const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const ActiveLeadSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    dateCreated: {
      type: String
    },
    userAssignment: {
      type: Boolean,
      default: false
    },
    belongsToTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    belongsToMortgage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mortgage'
    },
    ParcelNumber: {
      type: String
    },
    status: { // inactive, awaitingAction, investigating, closing, awaitingUpdate
      type: String
    },
    tier: {
      type: Number
      //one
      //two
      //three
      //four
    },
    oldTier: {
      type: Number
    },
    dateDiscovered: {
      type: String
    },
    dateDiscoveredLabel: {
      type: String
    },
    remainingMonths: {
      type: Number,
      default: 0,
    },
    originalDiscrepancies: [{
      type: String
    }],
    updates: [{
      type: Object
    }],
    //*
    //* Calculated at upload
    //*
    targetLoanAmount: {
      type: Number,
      default: 0,
    },
    targetLoanTerm: {
      type: Number,
      default: 0,
    },
    targetInterestRate: {
      type: Number,
      default: 0,
    },
    targetInterestDue: {
        type: Number,
        default: 0,
    },
    targetMonthlyPayments: {
        type: Number,
        default: 0,
    },
    targetProfitNumber: {
        type: Number,
        default: 0,
    },
    targetProfitPercent: {
        type: Number,
        default: 0,
    },
    notifCount: {
      type: Number,
      default: 0,
    },
    newAssignmentNotification: {
      type: Boolean,
      default: false
    },
    newLeadLabel: {
      type: Boolean,
      default: false
    },
    tagAdded: {
      type: Boolean,
      default: false
    },
    publicRecordsUpdated: {
      type: Boolean,
      default: false
    },
    awaitingUpdates: {
      type: Boolean,
      default: false
    },
    disableScan: {
      type: Boolean,
      default: false
    },
    dateDeleted: {
      type: String,
      default: '',
    },
    reportGenerated: {
      type: Boolean,
      default: false,
    },
    //*
    //* Investigating
    //*
    dateInvestigating: {
      type: String
    },
    targetOutcome: {
      type: String //unassigned, renegotiation, refinance
    },
    assigneeIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    assigneeNames: [{
      type: String
    }],
    timeline: [{
      type: Object
    }],
    tags: [{
      type: Object //{status:, tagId:, label:, description:, discrepancyFields:, apiMapping:}
    }],
    tagIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadTag'
    }],
    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
  }
);

ActiveLeadSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('ActiveLead', ActiveLeadSchema);
