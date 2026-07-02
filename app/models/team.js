const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    guests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    subscription: [{
      type: String,
      enum: ['executive', 'enterprise'],
    }],
    paymentSchedules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentSchedules"
    }],
    defaultPaymentSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentSchedules"
    },
    teamName: {
      type: String
    },
    dateCreated: {
      type: String
    },
    appAdminName: {
      type: String,
      defailt: '',
    },
    appAdminEmail: {
      type: String,
      defailt: '',
    },
    queryFrequency: {
      type: Number
    },
    lastQueryParsed: {
      type: Number
    },
    lastQuery: {
      type: String
    },
    nextQuery: {
      type: String
    },
    subscriptionMonthlyQueries: {
      type: String,
      default: 0,
    },
    remainingMonthlyQueries: {
      type: Number,
      default: 0,
    },
    completedScans: {
      type: Number,
      default: 0,
    },
    totalOriginalLoanAmount: {
      type: Number,
      default: 0,
    },
    totalOriginalInterest: {
      type: Number,
      default: 0,
    },
    totalAssessedPropertyValue: {
      type: Number,
      default: 0,
    },
    totalPrincipalRemaining: {
      type: Number,
      default: 0,
    },
    totalInterestRemaining: {
      type: Number,
      default: 0,
    },
    defaultTargetTerm: {
      type: Number
    },
    defaultTargetInterestRate: {
      type: Number
    },
    teamMonthlyStats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMonthlyStats"
    }],
    portfolioMonthlyStats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortfolioMonthlyStats"
    }],
    totalClosures: {
      type: Number,
      default: 0,
    },
    dismissedLeads: {
      type: Number,
      default: 0,
    },
    closedRefinances: {
      type: Number,
      default: 0,
    },
    closedRenegotiations: {
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
    averageProfitNumber: {
      type: Number,
      default: 0,
    },
    averageProfitPercent: {
      type: Number,
      default: 0,
    },
    lastRenegotiation: {
      type: String,
    },
    renegotiationFrequency: {
      type: Number,
      default: 0,
    },
    lastRefinance: {
      type: String
    },
    refinanceFrequency: {
      type: Number,
      default: 0,
    },
    totalSuccessfulQueries: {
      type: Number,
      default: 0,
    },
    totalLeadsGenerated: {
      type: Number,
      default: 0,
    },
    totalHits: {
      type: Number,
      default: 0,
    },
    totalHitsAvgPercent: {
      type: Number,
      default: 0,
    },
    totalTier1Leads: {
      type: Number,
      default: 0,
    },
    totalTier2Leads: {
      type: Number,
      default: 0,
    },
    totalManualLeads: {
      type: Number,
      default: 0,
    },
    tier1Closures: {
      type: Number,
      default: 0,
    },
    tier2Closures: {
      type: Number,
      default: 0,
    },
    manualClosures: {
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
    tier1Dismissed: {
      type: Number,
      default: 0,
    },
    tier2Dismissed: {
      type: Number,
      default: 0,
    },
    manualDismissed: {
      type: Number,
      default: 0,
    },
    clCurrentMortgagePriceOne: {
      type: Number,
      default: 0,
    },
    clCurrentMortgagePriceTwo: {
      type: Number,
      default: 0,
    },
    attomQueryPriceOne: {
      type: Number,
      default: 0,
    },
    attomQueryPriceTwo: {
      type: Number,
      default: 0,
    },
    pmQueryPriceOne: {
      type: Number,
      default: 0,
    },
    pmQueryPriceTwo: {
      type: Number,
      default: 0,
    },
    leadsAwaitingUpdate: {
      type: Number,
      default: 0,
    },
    leadsAwaitingVerification: {
      type: Number,
      default: 0,
    },
    require2FA: {
      type: Boolean,
      default: false,
    },
    enforceIPWhitelist: {
      type: Boolean,
      default: false,
    },
    mortgages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mortgage"
    }],
    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
    leadsAwaitingAction: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    investigatingLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    closingLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    awaitingUpdateLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    mortgageTags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "MortgageTag"
    }],
    leadTags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadTag"
    }],
    refinanceClosures: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Closure"
    }],
    renegotiationClosures: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Closure"
    }],
    notificationSchedule: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationSchedule"
    }],
    sweepParameters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "SweepParameter"
    }],
    uploadReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadReport"
    }],
    queryPerformances: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueryPerformanceStats"
    }],
  },
);

TeamSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Team', TeamSchema);
