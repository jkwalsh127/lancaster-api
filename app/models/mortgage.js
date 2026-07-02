const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const MortgageSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String // inactive, awaitingAction, investigating, closing, awaitingUpdate
    },
    notifCount: {
      type: Number,
      default: 0,
    },
    userAssignment: {
      type: Boolean,
      default: false
    },
    newAssignmentNotification: {
      type: Boolean,
      default: false
    },
    propMixSuccessDate: {
      type: String,
      default: '',
    },
    attomSuccessDate: {
      type: String,
      default: '',
    },
    coreLogicSuccessDate: {
      type: String,
      default: '',
    },
    propMixSuccessDate: {
      type: String,
      default: '',
    },
    attomSuccessDate: {
      type: String,
      default: '',
    },
    coreLogicSuccessDate: {
      type: String,
      default: '',
    },
    propertyType: {
      type: String,
      default: '',
    },
    amortizationSchedule: {
      type: Object, //apiMapping, label
      default: null,
    },
    loanType: {
      apiMapping: {
        type: String
      },
      label: {
        type: String
      },
    },
    parcelNumber: {
      type: String,
      default: '',
    },
    recordDetails: {
      type: Object
      // discrepancy: inactive, active, resolved, rejected
      // determines DOM classes in compare records
      // status: determines edit actions in compare records
      // inactive: "custom" or "swap" if boolean
      // edited: "undo"
      // discrepancy: "reject, match, custom"
      // match, initial
    },
    streetAddress: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    postalCode: {
      type: String,
      default: '',
    },
    unitNumber: {
      type: String,
      default: '',
    },
    owner1: {
      type: String,
      default: null,
    },
    owner2: {
      type: String,
      default: null,
    },
    previousOwner1: {
      type: String,
      default: null,
    },
    previousOwner2: {
      type: String,
      default: null,
    },
    //* Timeframe
    //* reqs
    mortgageTerm: {
      type: Number,
      default: '',
    },
    originationDate: {
      type: String,
      default: '',
    },
    //* results
    timeframePresent: {
      type: Boolean,
      default: false,
    },
    originationDateLabel: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    endDateLabel: {
      type: String,
      default: '',
    },
    remainingTerm: {
      type: String,
      default: '',
    },
    monthsRemaining: {
      type: Number,
      default: '',
    },
    //*
    //* Financials
    //* reqs
    originalLoanAmount: {
      type: Number,
      default: '',
    },
    originalInterestRate: {
      type: Number,
      default: '',
    },
    //* results
    financialsPresent: {
      type: Boolean,
      default: false,
    },
    monthlyPayments: {
      type: Number,
      default: '',
    },
    originalTotalDue: {
      type: Number,
      default: '',
    },
    originalInterestDue: {
      type: Number,
      default: '',
    },
    principalPaid: {
      type: Number,
      default: '',
    },
    interestPaid: {
      type: Number,
      default: '',
    },
    principalRemaining: {
      type: Number,
      default: '',
    },
    interestRemaining: {
      type: Number,
      default: 0,
    },
    assessedPropertyValue: {
      type: Number,
      default: 0,
    },
    //*
    activeDiscrepancies: {
      type: Number,
      default: 0,
    },
    rejectedDiscrepancies: {
      type: Number,
      default: 0,
    },
    resolvedDiscrepancies: {
      type: Number,
      default: 0,
    },
    assigneeIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    assigneeNames: [{
      type: String
    }],
    activeLeadTier: {
      type: Number,
      default: '',
    },
    activeLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    },
    tagAdded: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: Object //{status:, tagId:, label:, description:, discrepancyFields:, apiMapping:}
    }],
    payments: [{
      type: Object //{paymentDate:, interestPaid:, principalPaid:, earlyPayment}
    }],
    timeline: [{
      type: Object
    }],
    mortgageNotes: [{
      content: {
        type: String
      },
      date: {
        type: String
      },
      author: {
        type: String
      }
    }],
    propertyLiens: [{
      type: {
        type: String
      },
      dateFiled: {
        type: String
      },
    }],
    lastDiscrepanciesDiscovered: [{
      type: String,
      default: '',
    }],
    lastUpdateDate: {
      type: String,
      default: '-',
    },
    lastUpdateType: {
      type: String,
      default: '-',
    },
    lastUpdatedBy: {
      type: String,
      default: '',
    },
    recordSweeps: {
      type: Number,
      default: 0,
    },
    publicRecordsUpdated: {
      type: Boolean,
      default: false,
    },
    awaitingUpdates: {
      type: Boolean,
      default: false
    },
    uploadDate: {
      type: String,
      default: '',
    },
    propMixPropertyID: {
      type: String,
      default: null,
    },
    attomPropertyID: {
      type: String,
      default: null,
    },
    coreLogicPropertyID: {
      type: String,
      default: null,
    },
    tagIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MortgageTag'
    }],
    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
  }
);

MortgageSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Mortgage', MortgageSchema);
