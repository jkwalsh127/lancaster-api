const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const ActionsPermissionsSchema = new mongoose.Schema(
  {
    belongsToRole: {
      type: String,
    },
    csvMortgageUpload: {
      type: Boolean,
      default: false,
    },
    searchMortgageUpload: {
      type: Boolean,
      default: false,
    },
    checkMortgageDuplicates: {
      type: Boolean,
      default: false,
    },
    runSingleScan: {
      type: Boolean,
      default: false,
    },
    deleteMortgage: {
      type: Boolean,
      default: false,
    },
    clearMortgageCurrentPublicRecordValues: {
      type: Boolean,
      default: false,
    },
    clearMortgageCurrentRecordValues: {
      type: Boolean,
      default: false,
    },
    runRecordSweep: {
      type: Boolean,
      default: false,
    },
    deleteActionLog: {
      type: Boolean,
      default: false,
    },
    dropAllFromDatabase: {
      type: Boolean,
      default: false,
    },
    addMortgageType: {
      type: Boolean,
      default: false,
    },
    editParameterStatus: {
      type: Boolean,
      default: false,
    },
    editDefaultTargets: {
      type: Boolean,
      default: false,
    },
    editDefaultTargetType: {
      type: Boolean,
      default: false,
    },
    editDefaultPaymentSchedule: {
      type: Boolean,
      default: false,
    },
    editSecuritySettings: {
      type: Boolean,
      default: false,
    },
    assignMortgageTag: {
      type: Boolean,
      default: false,
    },
    createMortgageTag: {
      type: Boolean,
      default: false,
    },
    searchForProperty: {
      type: Boolean,
      default: false,
    },
    runMortgageScan: {
      type: Boolean,
      default: false,
    },
    saveFromSearch: {
      type: Boolean,
      default: false,
    },
    assignLeadTag: {
      type: Boolean,
      default: false,
    },
    createLeadTag: {
      type: Boolean,
      default: false,
    },
    setInvestigationClosing: {
      type: Boolean,
      default: false,
    },
    setInvestigationFinalized: {
      type: Boolean,
      default: false,
    },
    dismissLead: {
      type: Boolean,
      default: false,
    },
    validateLeadAwaitingUpdate: {
      type: Boolean,
      default: false,
    },
    saveTargetRefinanceChanges: {
      type: Boolean,
      default: false,
    },
    addMortgageNote: {
      type: Boolean,
      default: false,
    },
    addMortgagePayment: {
      type: Boolean,
      default: false,
    },
    resolveAllMortgageDiscrepancies: {
      type: Boolean,
      default: false,
    },
    editMortgageRecordDetails: {
      type: Boolean,
      default: false,
    },
    editLeadTargetOutcome: {
      type: Boolean,
      default: false,
    },
    addAssignees: {
      type: Boolean,
      default: false,
    },
    openLeadInvestigation: {
      type: Boolean,
      default: false,
    },
  }
);

ActionsPermissionsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('ActionsPermissions', ActionsPermissionsSchema);
