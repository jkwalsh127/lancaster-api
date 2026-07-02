const moment = require('moment');
const UserModel = require("../../models/user");
const TeamModel = require("../../models/team");
const ReportsModel = require("../../models/report")
const ActiveLeadModel = require("../../models/activeLead");
const ActionAndErrorLog = require('../../models/actionAndErrorLog');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const ActionsPermissionsModel = require('../../models/actionsPermissions');
const { loadMemberMonthlyStats } = require('../../utils/Load/memberMonthlyStats.utils');
const { loadTeamRefinanceMonthlyStats } = require('../../utils/Load/teamRefinanceMonthlyStats.utils');
const { loadTeamPortfolioMonthlyStats } = require('../../utils/Load/teamPortfolioMonthlyStats');
const { loadTeamRenegotiationMonthlyStats } = require('../../utils/Load/teamRenegotiationMonthlyStats.utils');
const { loadTeamLeadGenerationMonthlyStats } = require('../../utils/Load/teamLeadGenerationMonthlyStats.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function initialLoad(req, res) {
  try {
    console.info('********************************')
    console.info('********* INITIAL LOAD *********')
    console.info('********************************')
    console.time('elapsed-time')
    let user = await UserModel.findById(req.params.userId).populate('notificationSchedule').populate('memberMonthlyStats').select('memberMonthlyStats team notificationSchedule newReports fullName role email awaitingActionLeads investigatingLeads closingLeads awaitingUpdateLeads role dateCreated leadsAwaitingVerification leadsAwaitingUpdate assignedMortgages loginDates notifications firstName recordsVerified closedRenegotiations renegotiationFrequency closedRefinances refinanceFrequency grossProfitNumber grossProfitPercent defaultState defaultCity')
    let userDefaultState = user.defaultState
    let userDefaultCity = user.defaultCity
    let lastUserLogin = user.loginDates[0].date
    let userNewReportsCount = user.newReports.length
    let userActionsPermissions = await ActionsPermissionsModel.findOne({belongsToRole: user.role[0]})
    let currentUserActionsRole = user.role[0]
    let teamAdminData = {
      queryPerformances: [],
      uploadReports: [],
      actionsAndErrorsLog: [],
    }
    let team = {}
    if (!user) {
      let missingUser = true
      sendApiSuccessResponse(res, missingUser, 'no user')
    }
    let showWelcomeModal = true
    if (user.role[0] === 'super') {
      showWelcomeModal = false
      team = await TeamModel.findById(user.team).populate('reports').populate('members', 'fullName email firstName lastName role team').populate('refinanceClosures').populate('renegotiationClosures').populate('mortgages').populate("teamMonthlyStats").populate('notificationSchedule').populate('sweepParameters').populate('leadTags').populate('mortgageTags').populate('queryPerformances').populate('paymentSchedules').populate('defaultPaymentSchedule').populate('uploadReports').populate('portfolioMonthlyStats')
      let populatedUploads = team.uploadReports
      let reportIds = []
      for (let i = 0; i < team.reports.length; i++) {
        reportIds.push(team.reports[i]._id)
      }
      let actionsAndErrorsLog = await ActionAndErrorLog.find()
      teamAdminData = {
        queryPerformances: team.queryPerformances,
        uploadReports: populatedUploads,
        actionsAndErrorsLog: actionsAndErrorsLog,
      }
    } else {
      team = await TeamModel.findById(user.team).populate('reports').populate('members', 'fullName email firstName lastName role team').populate('refinanceClosures').populate('renegotiationClosures').populate('mortgages').populate("teamMonthlyStats").populate('notificationSchedule').populate('sweepParameters').populate('leadTags').populate('mortgageTags').populate("uploadReports").populate('queryPerformances').populate('paymentSchedules').populate('defaultPaymentSchedule').populate('portfolioMonthlyStats').select("reports teamMonthlyStats mortgages renegotiationClosures refinanceClosures members closedRefinances closedRenegotiations grossProfitNumber grossProfitPercent lastRenegotiation renegotiationFrequency lastRefinance refinanceFrequency lastQuery nextQuery leadsAwaitingAction investigatingLeads closingLeads awaitingUpdateLeads defaultTargetTerm defaultTargetInterestRate notificationSchedule sweepParameters averageProfitNumber averageProfitPercent leadTags mortgageTags dismissedLeads totalTier2Leads totalTier1Leads totalHitsAvgPercent totalHits totalLeadsGenerated totalSuccessfulQueries tier1Closures tier2Closures tier3Closures tier1Dismissed tier1D2smissed tier13ismissed totalClosures tier1Dismissed tier2Dismissed tier3Dismissed tier1Renegotations tier2Renegotations tier1Refinances tier2Refinances teamName dateCreated appAdminEmail appAdminName leadsAwaitingUpdate leadsAwaitingVerification require2FA enforceIPWhitelist paymentSchedules defaultTargetInterestRate manualRenegotiations queryPerformances manualRefinances remainingMonthlyQueries subscriptionMonthlyQueries uploadReports defaultPaymentSchedule manualClosures manualDismissed tier1Renegotiations tier2Renegotiations portfolioMonthlyStats totalInterestRemaining totalPrincipalRemaining totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue")

      let populatedUploads = team.uploadReports
      teamAdminData = {
        queryPerformances: team.queryPerformances,
        uploadReports: populatedUploads,
        actionsAndErrorsLog: [],
      }
    }
    let mortgages = team.mortgages

    let superTagsViewMortgages = null
    let ownerIsLLCMortgagesCount = 0
    let ownerIsLLCMortgages = []
    let ownerIsLLPMortgagesCount = 0
    let ownerIsLLPMortgages = []
    let ownerIsFLLPMortgagesCount = 0
    let ownerIsFLLPMortgages = []
    let ownerIsCorporationMortgagesCount = 0
    let ownerIsCorporationMortgages = []
    let ownerIsTrustMortgagesCount = 0
    let ownerIsTrustMortgages = []
    let ownerIsRevocableTrustMortgagesCount = 0
    let ownerIsRevocableTrustMortgages = []
    let ownerIsLivingTrustMortgagesCount = 0
    let ownerIsLivingTrustMortgages = []
    let ownerIsAssociationMortgagesCount = 0
    let ownerIsAssociationMortgages = []
    let miscEntityOwnerTypeMortgagesCount = 0
    let miscEntityOwnerTypeMortgages = []
    let commercialPropertyMortgagesCount = 0
    let commercialPropertyMortgages = []
    let residentialPropertyMortgagesCount = 0
    let residentialPropertyMortgages = []
    let miscPropertyTypeMortgagesCount = 0
    let miscPropertyTypeMortgages = []
    let fixedRateAmortizationMortgagesCount = 0
    let fixedRateAmortizationMortgages = []
    let conventionalLoanMortgagesCount = 0
    let conventionalLoanMortgages = []
    let miscLoanTypeMortgagesCount = 0
    let miscLoanTypeMortgages = []
    let taxInitialDelinquencyYearMortgagesCount = 0
    let taxInitialDelinquencyYearMortgages = []
    let taxInitialDelinquencyYearTagDetails = []
    let reoFlagMortgagesCount = 0
    let reoFlagMortgages = []
    let distressMortgagesCount = 0
    let distressMortgages = []
    let quitClaimMortgagesCount = 0
    let quitClaimMortgages = []
    let secondMortgageMortgagesCount = 0
    let secondMortgageMortgages = []
    let ownerOccupiedMortgagesCount = 0
    let ownerOccupiedMortgages = []
    let taxExemptionStatusMortgagesCount = 0
    let taxExemptionStatusMortgages = []
    for (let i = 0; i < mortgages.length; i++) {
      for (let j = 0; j < mortgages[i].tags.length; j++) {
        if (mortgages[i].tags[j].apiMapping === 'ownerIsLLC') {
          ownerIsLLCMortgagesCount = ownerIsLLCMortgagesCount + 1
          ownerIsLLCMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsLLP') {
          ownerIsLLPMortgagesCount = ownerIsLLPMortgagesCount + 1
          ownerIsLLPMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsFLLP') {
          ownerIsFLLPMortgagesCount = ownerIsFLLPMortgagesCount + 1
          ownerIsFLLPMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsCorporation') {
          ownerIsCorporationMortgagesCount = ownerIsCorporationMortgagesCount + 1
          ownerIsCorporationMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsTrust') {
          ownerIsTrustMortgagesCount = ownerIsTrustMortgagesCount + 1
          ownerIsTrustMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsRevocableTrust') {
          ownerIsRevocableTrustMortgagesCount = ownerIsRevocableTrustMortgagesCount + 1
          ownerIsRevocableTrustMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsLivingTrust') {
          ownerIsLivingTrustMortgagesCount = ownerIsLivingTrustMortgagesCount + 1
          ownerIsLivingTrustMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerIsAssociation') {
          ownerIsAssociationMortgagesCount = ownerIsAssociationMortgagesCount + 1
          ownerIsAssociationMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'miscEntityOwnerType') {
          miscEntityOwnerTypeMortgagesCount = miscEntityOwnerTypeMortgagesCount + 1
          miscEntityOwnerTypeMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'commercialProperty') {
          commercialPropertyMortgagesCount = commercialPropertyMortgagesCount + 1
          commercialPropertyMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'residentialProperty') {
          residentialPropertyMortgagesCount = residentialPropertyMortgagesCount + 1
          residentialPropertyMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'miscPropertyType') {
          miscPropertyTypeMortgagesCount = miscPropertyTypeMortgagesCount + 1
          miscPropertyTypeMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'fixedRateAmortization') {
          fixedRateAmortizationMortgagesCount = fixedRateAmortizationMortgagesCount + 1
          fixedRateAmortizationMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'conventionalLoan') {
          conventionalLoanMortgagesCount = conventionalLoanMortgagesCount + 1
          conventionalLoanMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'miscLoanType') {
          miscLoanTypeMortgagesCount = miscLoanTypeMortgagesCount + 1
          miscLoanTypeMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'taxInitialDelinquencyYear') {
          taxInitialDelinquencyYearMortgagesCount = taxInitialDelinquencyYearMortgagesCount + 1
          taxInitialDelinquencyYearMortgages.push(mortgages[i]._id)
          let matchingYear = taxInitialDelinquencyYearTagDetails.find(detail => detail.year === mortgages[i].tags[j].discrepancyFields[0])
          if (!matchingYear) {
            taxInitialDelinquencyYearTagDetails.push({
              year: mortgages[i].tags[j].discrepancyFields[0],
              count: 1,
            })
          } else {
            let matchingYearIndex = taxInitialDelinquencyYearTagDetails.indexOf(matchingYear)
            taxInitialDelinquencyYearTagDetails[matchingYearIndex].count++
          }
        } else if (mortgages[i].tags[j].apiMapping === 'reoFlag') {
          reoFlagMortgagesCount = reoFlagMortgagesCount + 1
          reoFlagMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'distress') {
          distressMortgagesCount = distressMortgagesCount + 1
          distressMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'quitClaim') {
          quitClaimMortgagesCount = quitClaimMortgagesCount + 1
          quitClaimMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'secondMortgage') {
          secondMortgageMortgagesCount = secondMortgageMortgagesCount + 1
          secondMortgageMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'ownerOccupied') {
          ownerOccupiedMortgagesCount = ownerOccupiedMortgagesCount + 1
          ownerOccupiedMortgages.push(mortgages[i]._id)
        } else if (mortgages[i].tags[j].apiMapping === 'taxExemptionStatus') {
          taxExemptionStatusMortgagesCount = taxExemptionStatusMortgagesCount + 1
          taxExemptionStatusMortgages.push(mortgages[i]._id)
        }
      }
    }
    //TODO Add Mortgage Type Tags
    //*
    //* Mortgage Tags
    //*

    //* Ownership Tags
    let ownerIsLLCMortgagesObj = {
      tagType: 'LLC Owner',
      tagTypeAbbr: 'LLC',
      apiMapping: 'ownerIsLLC',
      customTagView: false,
      totalMortgages: ownerIsLLCMortgagesCount,
      mortgages: ownerIsLLCMortgages,
      tagDetails: null,
    }
    let ownerIsLLPMortgagesObj = {
      tagType: 'LLP Owner',
      tagTypeAbbr: 'LLP',
      apiMapping: 'ownerIsLLP',
      customTagView: false,
      totalMortgages: ownerIsLLPMortgagesCount,
      mortgages: ownerIsLLPMortgages,
      tagDetails: null,
    }
    let ownerIsFLLPMortgagesObj = {
      tagType: 'FLLP Owner',
      tagTypeAbbr: 'FLLP',
      apiMapping: 'ownerIsFLLP',
      customTagView: false,
      totalMortgages: ownerIsFLLPMortgagesCount,
      mortgages: ownerIsFLLPMortgages,
      tagDetails: null,
    }
    let ownerIsCorporationMortgagesObj = {
      tagType: 'INC Owner',
      tagTypeAbbr: 'INC',
      apiMapping: 'ownerIsCorporation',
      customTagView: false,
      totalMortgages: ownerIsCorporationMortgagesCount,
      mortgages: ownerIsCorporationMortgages,
      tagDetails: null,
    }
    let ownerIsTrustMortgagesObj = {
      tagType: 'Trust Owner',
      tagTypeAbbr: 'TRUST',
      apiMapping: 'ownerIsTrust',
      customTagView: false,
      totalMortgages: ownerIsTrustMortgagesCount,
      mortgages: ownerIsTrustMortgages,
      tagDetails: null,
    }
    let ownerIsRevocableTrustMortgagesObj = {
      tagType: 'Revocable Trust Owner',
      tagTypeAbbr: 'Revoc.',
      apiMapping: 'ownerIsRevocableTrust',
      customTagView: false,
      totalMortgages: ownerIsRevocableTrustMortgagesCount,
      mortgages: ownerIsRevocableTrustMortgages,
      tagDetails: null,
    }
    let ownerIsLivingTrustMortgagesObj = {
      tagType: 'Living Trust Owner',
      tagTypeAbbr: 'Living Tr.',
      apiMapping: 'ownerIsLivingTrust',
      customTagView: false,
      totalMortgages: ownerIsLivingTrustMortgagesCount,
      mortgages: ownerIsLivingTrustMortgages,
      tagDetails: null,
    }
    let ownerIsAssociationMortgagesObj = {
      tagType: 'Association Owner',
      tagTypeAbbr: 'Association',
      apiMapping: 'ownerIsAssociation',
      customTagView: false,
      totalMortgages: ownerIsAssociationMortgagesCount,
      mortgages: ownerIsAssociationMortgages,
      tagDetails: null,
    }
    let miscEntityOwnerTypeMortgagesObj = {
      tagType: 'Misc Entity Owner',
      tagTypeAbbr: 'Misc Entity',
      apiMapping: 'miscEntityOwnerType',
      customTagView: false,
      totalMortgages: miscEntityOwnerTypeMortgagesCount,
      mortgages: miscEntityOwnerTypeMortgages,
      tagDetails: null,
    }
    //* Property Type Tags
    let commercialPropertyMortgagesObj = {
      tagType: 'Commercial Property',
      tagTypeAbbr: 'Commercial',
      apiMapping: 'commercialProperty',
      customTagView: false,
      totalMortgages: commercialPropertyMortgagesCount,
      mortgages: commercialPropertyMortgages,
      tagDetails: null,
    }
    let residentialPropertyMortgagesObj = {
      tagType: 'Residential Property',
      tagTypeAbbr: 'Residential',
      apiMapping: 'residentialProperty',
      customTagView: false,
      totalMortgages: residentialPropertyMortgagesCount,
      mortgages: residentialPropertyMortgages,
      tagDetails: null,
    }
    let miscPropertyTypeMortgagesObj = {
      tagType: 'Misc Property Type',
      tagTypeAbbr: 'Misc Property',
      apiMapping: 'miscPropertyType',
      customTagView: false,
      totalMortgages: miscPropertyTypeMortgagesCount,
      mortgages: miscPropertyTypeMortgages,
      tagDetails: null,
    }
    //* Amortization Type Tags
    let fixedRateAmortizationMortgagesObj = {
      tagType: 'Fixed-Rate Amortization',
      tagTypeAbbr: 'Fixed',
      apiMapping: 'fixedRateAmortization',
      customTagView: false,
      totalMortgages: fixedRateAmortizationMortgagesCount,
      mortgages: fixedRateAmortizationMortgages,
      tagDetails: null,
    }
    //* Loan Type Tags
    let conventionalLoanMortgagesObj = {
      tagType: 'Conventional Loan',
      tagTypeAbbr: 'Conventional',
      apiMapping: 'conventionalLoan',
      customTagView: false,
      totalMortgages: conventionalLoanMortgagesCount,
      mortgages: conventionalLoanMortgages,
      tagDetails: null,
    }
    let miscLoanTypeMortgagesObj = {
      tagType: 'Misc Loan Type',
      tagTypeAbbr: 'Misc Loan',
      apiMapping: 'miscLoanType',
      customTagView: false,
      totalMortgages: miscLoanTypeMortgagesCount,
      mortgages: miscLoanTypeMortgages,
      tagDetails: null,
    }
    //* Distress Tags (All One-Diemnsional)
    taxInitialDelinquencyYearTagDetails.sort(function(a, b) {
      return parseInt(b.year) - parseInt(a.year)
    });
    let taxInitialDelinquencyYearMortgagesObj = {
      tagType: 'Tax Initial Delinquency Year',
      tagTypeAbbr: 'Tax Delinq.',
      apiMapping: 'taxInitialDelinquencyYear',
      customTagView: false,
      totalMortgages: taxInitialDelinquencyYearMortgagesCount,
      mortgages: taxInitialDelinquencyYearMortgages,
      tagDetails: taxInitialDelinquencyYearTagDetails,
    }
    let reoFlagMortgagesObj = {
      tagType: 'Real Estate Owned (REO)',
      tagTypeAbbr: 'REO',
      apiMapping: 'reoFlag',
      customTagView: false,
      totalMortgages: reoFlagMortgagesCount,
      mortgages: reoFlagMortgages,
      tagDetails: null,
    }
    let distressMortgagesObj = {
      tagType: 'Distress',
      tagTypeAbbr: 'Disress',
      apiMapping: 'distress',
      customTagView: false,
      totalMortgages: distressMortgagesCount,
      mortgages: distressMortgages,
      tagDetails: null,
    }
    //* One-Dimensional Tags
    let quitClaimMortgagesObj = {
      tagType: 'Quit Claim',
      tagTypeAbbr: 'Quit Claim',
      apiMapping: 'quitClaim',
      customTagView: false,
      totalMortgages: quitClaimMortgagesCount,
      mortgages: quitClaimMortgages,
      tagDetails: null,
    }
    let secondMortgageMortgagesObj = {
      tagType: 'Second Mortgage',
      tagTypeAbbr: '2nd Loan',
      apiMapping: 'secondMortgage',
      customTagView: false,
      totalMortgages: secondMortgageMortgagesCount,
      mortgages: secondMortgageMortgages,
      tagDetails: null,
    }
    let ownerOccupiedMortgagesObj = {
      tagType: 'Owner Occupied',
      tagTypeAbbr: 'Owner Occ.',
      apiMapping: 'ownerOccupied',
      customTagView: false,
      totalMortgages: ownerOccupiedMortgagesCount,
      mortgages: ownerOccupiedMortgages,
      tagDetails: null,
    }
    let taxExemptionStatusMortgagesObj = {
      tagType: 'Tax Exemption',
      tagTypeAbbr: 'Tax ex.',
      apiMapping: 'taxExemptionStatus',
      customTagView: false,
      totalMortgages: taxExemptionStatusMortgagesCount,
      mortgages: taxExemptionStatusMortgages,
      tagDetails: null,
    }

    
    let tagsViewMortgages = [
      ownerIsCorporationMortgagesObj,
      ownerIsLLCMortgagesObj,
      ownerIsLLPMortgagesObj,
      ownerIsFLLPMortgagesObj,
      ownerIsTrustMortgagesObj,
      ownerIsRevocableTrustMortgagesObj,
      ownerIsLivingTrustMortgagesObj,
      ownerIsAssociationMortgagesObj,
      commercialPropertyMortgagesObj,
      residentialPropertyMortgagesObj,
      fixedRateAmortizationMortgagesObj,
      conventionalLoanMortgagesObj,
      secondMortgageMortgagesObj,
      taxInitialDelinquencyYearMortgagesObj,
      reoFlagMortgagesObj,
      distressMortgagesObj,
      quitClaimMortgagesObj,
      ownerOccupiedMortgagesObj,
      taxExemptionStatusMortgagesObj,
    ]
    if (user.role[0] === 'super') {
      superTagsViewMortgages = [
        miscEntityOwnerTypeMortgagesObj,
        miscPropertyTypeMortgagesObj,
        miscLoanTypeMortgagesObj,
      ]
    }

    let mortgageDataModel = [
      {subCat: 'Identifiers', fields: []},
      {subCat: 'Lot', fields: []},
      {subCat: 'Address', fields: []},
      {subCat: 'Summary', fields: []},
      {subCat: 'Sale', fields: []},
      {subCat: 'Living', fields: []},
      {subCat: 'Building', fields: []},
      {subCat: 'Assessment', fields: []},
      {subCat: 'Tax', fields: []},
      {subCat: 'Owner One', fields: []},
      {subCat: 'Owner Two', fields: []},
      {subCat: 'Primary Mortgage', fields: []},
      {subCat: 'Secondary Mortgage', fields: []}
    ]
    for (let j = 0; j < team.sweepParameters.length; j++) {
      if (team.sweepParameters[j].subCategory === 'identifiers') {
        mortgageDataModel[0].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'lot') {
        mortgageDataModel[1].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'address') {
        mortgageDataModel[2].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'summary') {
        mortgageDataModel[3].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'sale') {
        mortgageDataModel[4].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'living') {
        mortgageDataModel[5].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'building') {
        mortgageDataModel[6].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'assessment') {
        mortgageDataModel[7].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'tax') {
        mortgageDataModel[8].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'owner1') {
        mortgageDataModel[9].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'owner2') {
        mortgageDataModel[10].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'primaryMortgage') {
        mortgageDataModel[11].fields.push(team.sweepParameters[j])
      } else if (team.sweepParameters[j].subCategory === 'secondaryMortgage') {
        mortgageDataModel[12].fields.push(team.sweepParameters[j])
      }
    }

    let leadTagIds = []
    let macroLeadTags = []
    for (let i = 0; i < team.leadTags.length; i++) {
      leadTagIds.push(team.leadTags[i]._id)
      if (!team.leadTags[i].apiMapping.toUpperCase().includes('NEWOWNER')) {
        macroLeadTags.push(team.leadTags[i])
      }
    }
    let mortgageTagIds = []
    for (let i = 0; i < team.mortgageTags.length; i++) {
      mortgageTagIds.push(team.mortgageTags[i]._id)
    }
    
    let thisDate = moment(new Date());
    let thisDateToParse = moment(thisDate.toISOString().substring(0,7));
    let teamLeadsAwaitingUpdate = team.leadsAwaitingUpdate
    let teamLeadsAwaitingVerification = team.leadsAwaitingVerification
    let memberAssignments = {}
    let teamMembersByName = []
    let membersDataArray = []
    let teamMembersInfo = []
    let superMembers = []
    let adminMembers = []
    let userMembers = []
    let userAwaitingActionLeads = []
    let userInvestigatingLeads = []
    let userClosingLeads = []
    let userAwaitingUpdateLeads = []
    let teamMembersMonthlyStats = []
    let users = []

    let teamAwaitingActionLeads = [];
    for (let i = (team.leadsAwaitingAction.length - 1); i >= 0; i--) {
      let leadAwaitingAction = await ActiveLeadModel.findById(team.leadsAwaitingAction[i]).populate('belongsToMortgage').populate('reports')
      teamAwaitingActionLeads.push(leadAwaitingAction);
    }
    let teamInvestigatingLeads = [];
    for (let i = 0; i < team.investigatingLeads.length; i++) {
      let investigatingLead = await ActiveLeadModel.findById(team.investigatingLeads[i]).populate('belongsToMortgage').populate('reports')
      teamInvestigatingLeads.push(investigatingLead);
    }
    let teamClosingLeads = [];
    for (let i = (team.closingLeads.length - 1); i >= 0; i--) {
      let closingLead = await ActiveLeadModel.findById(team.closingLeads[i]).populate('belongsToMortgage').populate('reports')
      teamClosingLeads.push(closingLead);
    }
    let teamAwaitingUpdateLeads = [];
    for (let i = (team.awaitingUpdateLeads.length - 1); i >= 0; i--) {
      let awaitingUpdateLead = await ActiveLeadModel.findById(team.awaitingUpdateLeads[i]).populate('belongsToMortgage').populate('reports')
      teamAwaitingUpdateLeads.push(awaitingUpdateLead);
    }

    for (let i = 0; i < team.members.length; i++) {
      let member = {}
      let memberClosingLeads = []
      let memberInvestigatingLeads = []
      let memberAwaitingActionLeads = []
      let memberAwaitingUpdateLeads = []
      if (team.members[i].toString() === user._id.toString()) {
        member = user
      } else {
        member = await UserModel.findById(team.members[i]).populate('memberMonthlyStats').select('memberMonthlyStats dateCreated awaitingActionLeads investigatingLeads closingLeads awaitingUpdateLeads fullName firstName role email assignedMortgages loginDates leadsAwaitingVerification leadsAwaitingUpdate recordsVerified closedRenegotiations renegotiationFrequency closedRefinances refinanceFrequency grossProfitNumber grossProfitPercent')
      }
      if (user.role[0] === 'super') {
        users.push(member)
      }
      if (member.role[0] !== 'super') {
        let memberMonthlyStatsArray = await loadMemberMonthlyStats(member.memberMonthlyStats, thisDate, thisDateToParse)
        teamMembersMonthlyStats.push({
          memberId: member._id,
          memberMonthlyStats: memberMonthlyStatsArray,
        })
      }
      for (let j = 0; j < member.awaitingActionLeads.length; j++) {
        if (member._id.toString() === user._id.toString()) {
          let matchedLead = teamAwaitingActionLeads.find(lead => lead._id.toString() === member.awaitingActionLeads[j].toString())
          if (matchedLead) {
            matchedLead.userAssignment = true
          }
        }
        let awaitingActionLead = await ActiveLeadModel.findById(member.awaitingActionLeads[j]).populate('belongsToMortgage').populate('reports')
        memberAwaitingActionLeads.push(awaitingActionLead)
        if (team.members[i]._id.toString() === user._id.toString()) {
          userAwaitingActionLeads.push(awaitingActionLead)
        }
      }
      for (let j = 0; j < member.investigatingLeads.length; j++) {
        if (member._id.toString() === user._id.toString()) {
          let matchedLead = teamInvestigatingLeads.find(lead => lead._id.toString() === member.investigatingLeads[j].toString())
          if (matchedLead) {
            matchedLead.userAssignment = true
          }
        }
        let investigatingLead = await ActiveLeadModel.findById(member.investigatingLeads[j]).populate('belongsToMortgage').populate('reports')
        memberInvestigatingLeads.push(investigatingLead)
        if (team.members[i]._id.toString() === user._id.toString()) {
          userInvestigatingLeads.push(investigatingLead)
        }
      }
      for (let j = 0; j < member.closingLeads.length; j++) {
        if (member._id.toString() === user._id.toString()) {
          let matchedLead = teamClosingLeads.find(lead => lead._id.toString() === member.closingLeads[j].toString())
          if (matchedLead) {
            matchedLead.userAssignment = true
          }
        }
        let closingLead = await ActiveLeadModel.findById(member.closingLeads[j]).populate('belongsToMortgage').populate('reports')
        memberClosingLeads.push(closingLead)
        if (team.members[i]._id.toString() === user._id.toString()) {
          userClosingLeads.push(closingLead)
        }
      }
      for (let j = 0; j < member.awaitingUpdateLeads.length; j++) {
        if (member._id.toString() === user._id.toString()) {
          let matchedLead = teamAwaitingUpdateLeads.find(lead => lead._id.toString() === member.awaitingUpdateLeads[j].toString())
          if (matchedLead) {
            matchedLead.userAssignment = true
          }
        }
        let awaitingUpdateLead = await ActiveLeadModel.findById(member.awaitingUpdateLeads[j]).populate('belongsToMortgage').populate('reports')
        memberAwaitingUpdateLeads.push(awaitingUpdateLead)
        if (team.members[i]._id.toString() === user._id.toString()) {
          userAwaitingUpdateLeads.push(awaitingUpdateLead)
        }
      }

      if (team.members[i]._id.toString() === user._id.toString()) {
        let totalUserInvestigations = memberAwaitingActionLeads.length + memberInvestigatingLeads.length + memberClosingLeads.length + memberAwaitingUpdateLeads.length
        memberAssignments = {
          memberId: member._id.toString(),
          fistName: member.firstName,
          lastName: member.lastName,
          fullName: member.fullName,
          role: member.role[0],
          email: member.email,
          assignedMortgages: member.assignedMortgages,
          awaitingActionLeads: memberAwaitingActionLeads,
          investigatingLeads: memberInvestigatingLeads,
          closingLeads: memberClosingLeads,
          awaitingUpdateLeads: memberAwaitingUpdateLeads,
          filteredAwaitingActionLeads: [],
          filteredInvestigatingLeads: [],
          filteredClosingLeads: [],
          filteredAwaitingUpdateLeads: [],
          leadsAwaitingUpdate: 0,
          leadsAwaitingVerification: 0,
          totalUserInvestigations: totalUserInvestigations,
        }
      }

      if (member.role[0] === "super") {
        superMembers.push({
          memberId: member._id.toString(),
          fullName: member.fullName,
          role: member.role[0],
          email: member.email,
          awaitingActionLeads: memberAwaitingActionLeads,
          investigatingLeads: memberInvestigatingLeads,
          closingLeads: memberClosingLeads,
          awaitingUpdateLeads: memberAwaitingUpdateLeads,
          filteredAwaitingActionLeads: [],
          filteredInvestigatingLeads: [],
          filteredClosingLeads: [],
          filteredAwaitingUpdateLeads: [],
        })
      } else {
        if (member.role[0] === "admin") {
          adminMembers.push({
            memberId: member._id.toString(),
            fullName: member.fullName,
            role: member.role[0],
            email: member.email,
            awaitingActionLeads: memberAwaitingActionLeads,
            investigatingLeads: memberInvestigatingLeads,
            closingLeads: memberClosingLeads,
            awaitingUpdateLeads: memberAwaitingUpdateLeads,
            filteredAwaitingActionLeads: [],
            filteredInvestigatingLeads: [],
            filteredClosingLeads: [],
            filteredAwaitingUpdateLeads: [],
          })
        } else {
          userMembers.push({
            memberId: member._id.toString(),
            fullName: member.fullName,
            role: member.role[0],
            email: member.email,
            awaitingActionLeads: memberAwaitingActionLeads,
            investigatingLeads: memberInvestigatingLeads,
            closingLeads: memberClosingLeads,
            awaitingUpdateLeads: memberAwaitingUpdateLeads,
            filteredAwaitingActionLeads: [],
            filteredInvestigatingLeads: [],
            filteredClosingLeads: [],
            filteredAwaitingUpdateLeads: [],
          })
        }
        teamMembersByName.push({
          memberId: member._id.toString(),
          role: member.role[0],
          fullName: member.fullName,
          firstName: member.firstName,
        })
        teamMembersInfo.push({
          memberId: member._id.toString(),
          dateCreated: member.dateCreated,
          role: member.role[0],
          email: member.email,
          fullName: member.fullName,
          //* Member Performance Sidebar
          awaitingActionLeadsNum: member.awaitingActionLeads.length,
          investigatingLeadsNum: member.investigatingLeads.length,
          closingLeadsNum: member.closingLeads.length,
          awaitingUpdateLeadsNum: member.leadsAwaitingUpdate,
          awaitingVerificationLeadsNum: member.leadsAwaitingVerification,
          lastLoginDate: member.loginDates[0].date,
          //* Member Performance Stats Window
          closedRenegotiations: member.closedRenegotiations,
          renegotiationFrequency: member.renegotiationFrequency,
          closedRefinances: member.closedRefinances,
          refinanceFrequency: member.refinanceFrequency,
          grossProfitNumber: member.grossProfitNumber,
          grossProfitPercent: member.grossProfitPercent,
        })
      }
    }
    // for (let i = 0; i < superMembers.length; i++) {
    //   membersDataArray.push(superMembers[i])
    // }
    for (let i = 0; i < adminMembers.length; i++) {
      membersDataArray.push(adminMembers[i])
    }
    for (let i = 0; i < userMembers.length; i++) {
      membersDataArray.push(userMembers[i])
    }
    let teamReports = [];
    for (let i = 0; i < team.reports.length; i++) {
      let report = await ReportsModel.findById(team.reports[i]);
      teamReports.push(report)
    }
    for (let i = 0; i < user.newReports.length; i++) {
      let matchedReport = teamReports.find(report => report._id.toString() === user.newReports[i].toString())
      let thisReportIndex = teamReports.indexOf(matchedReport)
      teamReports[thisReportIndex].notifyUser = true
    }

    let teamStats = {
      leadGenerations: {
        totalSuccessfulQueries: team.totalSuccessfulQueries,
        totalLeadsGenerated: team.totalLeadsGenerated,
        totalHits: team.totalHits,
        totalHitsAvgPercent: team.totalHitsAvgPercent,
        totalTier1Leads: team.totalTier1Leads,
        totalTier2Leads: team.totalTier2Leads,
      },
      dismissedLeads: team.dismissedLeads,
      renegotiations: {
        closedRenegotiations: team.closedRenegotiations,
        lastRenegotiation: team.lastRenegotiation,
        renegotiationFrequency: team.renegotiationFrequency,
      },
      refinances: {
        closedRefinances: team.closedRefinances,
        grossProfitNumber: team.grossProfitNumber,
        grossProfitPercent: team.grossProfitPercent,
        averageProfitNumber: team.averageProfitNumber,
        averageProfitPercent: team.averageProfitPercent,
        lastRefinance: team.lastRefinance,
        refinanceFrequency: team.refinanceFrequency,
      },
      query: {
        lastQuery: team.lastQuery,
        nextQuery: team.nextQuery,
        remainingMonthlyQueries: team.remainingMonthlyQueries,
        subscriptionMonthlyQueries: team.subscriptionMonthlyQueries,
      },
      pieCharts: {
        closureType: [
          {name: `Renegotiations: ${team.closedRenegotiations}`, size: parseInt(`${team.closedRenegotiations}`)},
          {name: `Refinances: ${team.closedRefinances}`, size: parseInt(`${team.closedRefinances}`)},
        ],
        actionType: [
          {name: `${team.totalClosures}`, size: parseInt(`${team.totalClosures}`)},
          {name: `${team.dismissedLeads}`, size: parseInt(`${team.dismissedLeads}`)},
        ],
        tier1: [
          {name: `${team.tier1Closures}`, size: parseInt(`${team.tier1Closures}`)},
          {name: `${team.tier1Dismissed}`, size: parseInt(`${team.tier1Dismissed}`)},
        ],
        tier2: [
          {name: `${team.tier2Closures}`, size: parseInt(`${team.tier2Closures}`)},
          {name: `${team.tier2Dismissed}`, size: parseInt(`${team.tier2Dismissed}`)},
        ],
        manual: [
          {name: `${team.manualClosures}`, size: parseInt(`${team.manualClosures}`)},
          {name: `${team.manualDismissed}`, size: parseInt(`${team.manualDismissed}`)},
        ],
        renegotiations: [
          {name: `${team.tier1Renegotiations}`, size: parseInt(`${team.tier1Renegotiations}`)},
          {name: `${team.tier2Renegotiations}`, size: parseInt(`${team.tier2Renegotiations}`)},
          {name: `${team.manualRenegotiations}`, size: parseInt(`${team.manualRenegotiations}`)},
        ],
        refinances: [
          {name: `${team.tier1Refinances}`, size: parseInt(`${team.tier1Refinances}`)},
          {name: `${team.tier2Refinances}`, size: parseInt(`${team.tier2Refinances}`)},
          {name: `${team.manualRefinances}`, size: parseInt(`${team.manualRefinances}`)},
        ],
      },
      tagsViewMortgages: tagsViewMortgages,
      superTagsViewMortgages: superTagsViewMortgages,
      customTagViewAdded: false,
    }
    let closingCount = 0
    let newClosingCount = 0
    let notificationsCount = 0
    let investigatingCount = 0
    let mortgageNotifCount = 0
    let awaitingActionCount = 0
    let awaitingUpdatesCount = 0
    let newInvestigatingCount = 0
    let userQueryNotification = null
    let userLeadNotifications = []
    let newAwaitingActionCount = 0
    let userUploadNotification = null
    let queryNotificationsCount = 0
    let newAwaitingUpdatesCount = 0
    let uploadNotificationsCount = 0
    let userMortgageNotifications = []
    let queryNotificationPresent = false
    let uploadNotificationPresent = false
    let userLeadRemovedNotifications = []
    let userLeadAssignedNotifications = []
    let userLeadDismissedNotifications = []
    let userLeadFinalizedNotifications = []
    let userMortgageRemovedNotifications = []
    let userMortgageAssignedNotifications = []
    let userNotifications = user.notifications
    for (let i = 0; i < userNotifications.length; i++) {
      if (userNotifications[i].notifType === 'leadAssigned') {
        userLeadAssignedNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'leadRemoved') {
        userLeadRemovedNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'lead') {
        userLeadNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'leadDismissed') {
        userLeadDismissedNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'leadFinalized') {
        userLeadFinalizedNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'mortgage') {
        userMortgageNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'mortgageAssigned') {
        userMortgageAssignedNotifications.push(userNotifications[i])
      } else if (userNotifications[i].notifType === 'mortgageRemoved') {
        userMortgageRemovedNotifications.push(userNotifications[i])
      }
      if (userNotifications[i].notifType === 'query' || userNotifications[i].notifType === 'upload') {
        if (userNotifications[i].notifType === 'query') {
          userQueryNotification = userNotifications[i]
          queryNotificationsCount = userNotifications[i].notifCount
          queryNotificationPresent = true
        } else {
          userUploadNotification = userNotifications[i]
          uploadNotificationsCount = userNotifications[i].notifCount
          uploadNotificationPresent = true
        }
        if (userNotifications[i].newLeadIds) {
          for (let j = 0; j < userNotifications[i].newLeadIds.length; j++) {
            let matchedLead = teamAwaitingActionLeads.find(lead => lead.toString() === userNotifications[i].newLeadIds[j].toString())
            if (matchedLead) {
              matchedLead.newLeadLabel = true
              newAwaitingActionCount++
            } else {
              let matchedLead = teamInvestigatingLeads.find(lead => lead.toString() === userNotifications[i].newLeadIds[j].toString())
              if (matchedLead) {
                matchedLead.newLeadLabel = true
                newInvestigatingCount++
              } else {
                let matchedLead = teamClosingLeads.find(lead => lead.toString() === userNotifications[i].newLeadIds[j].toString())
                if (matchedLead) {
                  matchedLead.newLeadLabel = true
                  newClosingCount++
                } else {
                  let matchedLead = teamAwaitingUpdateLeads.find(lead => lead.toString() === userNotifications[i].newLeadIds[j].toString())
                  if (matchedLead) {
                    matchedLead.newLeadLabel = true
                    newAwaitingUpdatesCount++
                  }
                }
              }
            }
          }
        }
      } else {
        notificationsCount++
        if (userNotifications[i].leadId) {
          let matchedLead = teamAwaitingActionLeads.find(lead => lead._id.toString() === userNotifications[i].leadId.toString())
          if (matchedLead) {
            if (userNotifications[i].notifType === 'leadAssigned') {
              matchedLead.newAssignmentNotification = true
            }
            matchedLead.notifCount = userNotifications[i].notifCount
            awaitingActionCount++
          } else {
            matchedLead = teamInvestigatingLeads.find(lead => lead._id.toString() === userNotifications[i].leadId.toString())
            if (matchedLead) {
              if (userNotifications[i].notifType === 'leadAssigned') {
                matchedLead.newAssignmentNotification = true
              }
              matchedLead.notifCount = userNotifications[i].notifCount
              investigatingCount++
            } else {
              matchedLead = teamClosingLeads.find(lead => lead._id.toString() === userNotifications[i].leadId.toString())
              if (matchedLead) {
                if (userNotifications[i].notifType === 'leadAssigned') {
                  matchedLead.newAssignmentNotification = true
                }
                matchedLead.notifCount = userNotifications[i].notifCount
                closingCount++
              } else {
                matchedLead = teamAwaitingUpdateLeads.find(lead => lead._id.toString() === userNotifications[i].leadId.toString())
                if (matchedLead) {
                  if (userNotifications[i].notifType === 'leadAssigned') {
                    matchedLead.newAssignmentNotification = true
                  }
                  matchedLead.notifCount = userNotifications[i].notifCount
                  awaitingUpdatesCount++
                }
              }
            }
          }
          if (matchedLead) {
            for (let j = 0; j < userNotifications[i].timelineGuids.length; j++) {
              let matchingTimeline = matchedLead.timeline.find(milestone => milestone.guid === userNotifications[i].timelineGuids[j])
              if (matchingTimeline) {
                matchingTimeline.notify = true
              }
            }
          }
          let matchedMortgage = mortgages.find(lead => lead._id.toString() === userNotifications[i].mortgageId.toString())
          if (matchedMortgage) {
            if (userNotifications[i].notifType === 'mortgageAssigned' || userNotifications[i].notifType === 'leadAssigned') {
              // if (userNotifications[i].notifType === 'mortgageAssigned') {
              //   mortgageNotifCount++
              // }
              userNotifications[i].address = matchedMortgage.streetAddress
              userNotifications[i].owner1 = matchedMortgage.owner1
              mortgageNotifCount++
              matchedMortgage.newAssignmentNotification = true
            }
            matchedMortgage.notifCount = matchedMortgage.notifCount + userNotifications[i].notifCount
            for (let j = 0; j < userNotifications[i].timelineGuids.length; j++) {
              let matchingTimeline = matchedMortgage.timeline.find(milestone => milestone.guid === userNotifications[i].timelineGuids[j])
              if (matchingTimeline) {
                matchingTimeline.notify = true
              }
            }
          }
        } else {
          mortgageNotifCount++
          let matchedMortgage = mortgages.find(mortgage => mortgage._id.toString() === userNotifications[i].mortgageId.toString())
          if (matchedMortgage) {
            if (userNotifications[i].notifType === 'mortgageAssigned') {
              matchedMortgage.newAssignmentNotification = true
            }
            matchedMortgage.notifCount = matchedMortgage.notifCount + userNotifications[i].notifCount
            for (let j = 0; j < userNotifications[i].timelineGuids.length; j++) {
              let matchingTimeline = matchedMortgage.timeline.find(milestone => milestone.guid === userNotifications[i].timelineGuids[j])
              if (matchingTimeline) {
                matchingTimeline.notify = true
              }
            }
          }
        }
      }
    }
    for (let i = 0; i < user.assignedMortgages.length; i++) {
      let assignedMortgage = mortgages.find(mortgage => mortgage._id.toString() === user.assignedMortgages[i].toString())
      if (assignedMortgage) {
        assignedMortgage.userAssignment = true
      }
    }
    await user.updateOne({
      notifications: []
    })
    let notificationsObj = {
      userQueryNotification: userQueryNotification,
      userUploadNotification: userUploadNotification,
      userLeadAssignedNotifications: userLeadAssignedNotifications,
      userLeadRemovedNotifications: userLeadRemovedNotifications,
      userLeadNotifications: userLeadNotifications,
      userLeadDismissedNotifications: userLeadDismissedNotifications,
      userLeadFinalizedNotifications: userLeadFinalizedNotifications,
      userMortgageNotifications: userMortgageNotifications,
      userMortgageAssignedNotifications: userMortgageAssignedNotifications,
      userMortgageRemovedNotifications: userMortgageRemovedNotifications,
      lastUserLogin: lastUserLogin,
      awaitingActionCount: awaitingActionCount,
      newAwaitingActionCount: newAwaitingActionCount,
      investigatingCount: investigatingCount,
      newInvestigatingCount: newInvestigatingCount,
      newClosingCount: newClosingCount,
      closingCount: closingCount,
      newAwaitingUpdatesCount: newAwaitingUpdatesCount,
      awaitingUpdatesCount: awaitingUpdatesCount,
      mortgageNotifCount: mortgageNotifCount,
      notificationsCount: notificationsCount,
      queryNotificationsCount: queryNotificationsCount,
      uploadNotificationsCount: uploadNotificationsCount,
      queryNotificationPresent: queryNotificationPresent,
      uploadNotificationPresent: uploadNotificationPresent,
      userNewReportsCount: userNewReportsCount,
    }
    let teamRefinanceClosures = [];
    for (let i = (team.refinanceClosures.length - 1); i >= 0; i--) {
      teamRefinanceClosures.push(team.refinanceClosures[i]); 
    }
    let teamRenegotiationClosures = [];
    for (let i = 0; i < team.renegotiationClosures.length; i++) {
      teamRenegotiationClosures.push(team.renegotiationClosures[i]); 
    }
    let tier1Parameters = []
    let tier1ParameterTotal = {
      name: 'Tier 1',
      children: []
    }
    let tier1ParameterRenegotiations = {
      name: 'Tier 1',
      children: []
    }
    let tier1ParameterRefinances = {
      name: 'Tier 1',
      children: []
    }
    let tier1ParameterDismissals = {
      name: 'Tier 1',
      children: []
    }
    let tier2Parameters = []
    let tier2ParameterTotal = {
      name: 'Tier 2',
      children: []
    }
    let tier2ParameterRenegotiations = {
      name: 'Tier 2',
      children: []
    }
    let tier2ParameterRefinances = {
      name: 'Tier 2',
      children: []
    }
    let tier2ParameterDismissals = {
      name: 'Tier 2',
      children: []
    }
    let tier3Parameters = []
    for (let i = 0; i < team.sweepParameters.length; i++) {
      if (team.sweepParameters[i].assignedTier === 'one') {
        tier1ParameterTotal.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          refinances: team.sweepParameters[i].refinances,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier1ParameterRenegotiations.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].renegotiations,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          refinances: team.sweepParameters[i].refinances,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier1ParameterRefinances.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].refinances,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier1ParameterDismissals.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].dismissals,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          refinances: team.sweepParameters[i].refinances,
        })
        tier1Parameters.push(team.sweepParameters[i])
      } else if (team.sweepParameters[i].assignedTier === 'two') {
        tier2ParameterTotal.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          refinances: team.sweepParameters[i].refinances,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier2ParameterRenegotiations.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].renegotiations,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          refinances: team.sweepParameters[i].refinances,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier2ParameterRefinances.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].refinances,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          dismissals: team.sweepParameters[i].dismissals,
        })
        tier2ParameterDismissals.children.push({
          name: team.sweepParameters[i].label,
          size: team.sweepParameters[i].dismissals,
          total: team.sweepParameters[i].renegotiations + team.sweepParameters[i].refinances,
          renegotiations: team.sweepParameters[i].renegotiations,
          refinances: team.sweepParameters[i].refinances,
        })
        tier2Parameters.push(team.sweepParameters[i])
      } else {
        tier3Parameters.push(team.sweepParameters[i])
      }
    }
    let parameterStatistics = {
      all: [tier1ParameterTotal, tier2ParameterTotal],
      renegotiations: [tier1ParameterRenegotiations, tier2ParameterRenegotiations],
      refinances: [tier1ParameterRefinances, tier2ParameterRefinances],
      dismissals: [tier1ParameterDismissals, tier2ParameterDismissals],
    }
    let sweepParameters = {
      discrepancyParameters: parameterStatistics,
      tier1Parameters: tier1Parameters,
      tier2Parameters: tier2Parameters,
      tier3Parameters: tier3Parameters,
    }
    let teamMembersData = {
      teamMembersInfo: teamMembersInfo,
      teamMembersByName: teamMembersByName,
      teamMembersMonthlyStats: teamMembersMonthlyStats,
    }
    let teamAndUserSettings = {
      team: {
        teamName: team.teamName,
        dateCreated: team.dateCreated,
        appAdminName: team.appAdminName,
        appAdminEmail: team.appAdminEmail,
        numberOfUsers: userMembers.length + adminMembers.length,
        paymentSchedules: team.paymentSchedules,
        defaultPaymentSchedule: team.defaultPaymentSchedule,
        defaultTargets: {
          defaultTargetTerm: team.defaultTargetTerm,
          defaultTargetInterestRate: team.defaultTargetInterestRate,
        },
        security: {
          require2FA: team.require2FA,
          enforceIPWhitelist: team.enforceIPWhitelist,
        },
        notificationSchedule: team.notificationSchedule,
        mortgageTagIds: mortgageTagIds,
        mortgageTags: team.mortgageTags,
        leadTagIds:  leadTagIds,
        leadTags: [...team.leadTags],
        macroLeadTags: macroLeadTags,
      },
      user: {
        defaultLocations: {
          city: userDefaultCity,
          state: userDefaultState,
        }
      },
    }

    //* Portfolio Monthly Stats
    let teamPortfolioMonthlyStats = await loadTeamPortfolioMonthlyStats(team.portfolioMonthlyStats, thisDate, thisDateToParse)
    let teamPortfolioMonthlyStatsAll = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsAll
    let teamPortfolioMonthlyStatsTwoYear = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsTwoYear
    let teamPortfolioMonthlyStatsOneYear = teamPortfolioMonthlyStats.teamPortfolioMonthlyStatsOneYear

    //* Lead Generation Monthly Stats
    let teamLeadGenerationMonthlyStats = await loadTeamLeadGenerationMonthlyStats(team.teamMonthlyStats, thisDate, thisDateToParse)
    let teamLeadGenerationAll = teamLeadGenerationMonthlyStats.teamLeadGenerationAll
    let teamLeadGenerationTwoYear = teamLeadGenerationMonthlyStats.teamLeadGenerationTwoYear
    let teamLeadGenerationOneYear = teamLeadGenerationMonthlyStats.teamLeadGenerationOneYear

    //* Renegotiation Monthly Stats
    let teamRenegotiationnMonthlyStats = await loadTeamRenegotiationMonthlyStats(team.teamMonthlyStats, thisDate, thisDateToParse)
    let currentFirstRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.currentFirstRenegotiationClosuresTeam
    let currentSecondRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.currentSecondRenegotiationClosuresTeam
    let currentThirdRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.currentThirdRenegotiationClosuresTeam
    let previousFirstRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.previousFirstRenegotiationClosuresTeam
    let previousSecondRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.previousSecondRenegotiationClosuresTeam
    let previousThirdRenegotiationClosuresTeam = teamRenegotiationnMonthlyStats.previousThirdRenegotiationClosuresTeam
    let teamRenegotiationMonthlyStatsAll = teamRenegotiationnMonthlyStats.teamRenegotiationMonthlyStatsAll
    let teamRenegotiationMonthlyStatsTwoYear = teamRenegotiationnMonthlyStats.teamRenegotiationMonthlyStatsTwoYear
    let teamRenegotiationMonthlyStatsOneYear = teamRenegotiationnMonthlyStats.teamRenegotiationMonthlyStatsOneYear
    let teamRenegotiationQuarterBreakdown = teamRenegotiationnMonthlyStats.teamRenegotiationQuarterBreakdown
    
    let currentTeamRenegotiationProgress = 0;
    let currentTeamRenegotiationClosures = currentFirstRenegotiationClosuresTeam + currentSecondRenegotiationClosuresTeam + currentThirdRenegotiationClosuresTeam;
    let previousTeamRenegotiationClosures = previousThirdRenegotiationClosuresTeam + previousSecondRenegotiationClosuresTeam + previousFirstRenegotiationClosuresTeam;
    if (previousTeamRenegotiationClosures === 0) {
      currentTeamRenegotiationProgress = 'N/A'
    } else {
      currentTeamRenegotiationProgress = (Math.round(((currentTeamRenegotiationClosures/previousTeamRenegotiationClosures) * 100)*10)/10);
    }
    teamRenegotiationQuarterBreakdown.currentRenegotiations = currentTeamRenegotiationClosures;
    teamRenegotiationQuarterBreakdown.previousRenegotiations = previousTeamRenegotiationClosures;
    teamRenegotiationQuarterBreakdown.currentProgress = currentTeamRenegotiationProgress;
    
    //* Refinance Monthly Stats
    let teamRefinanceMonthlyStats = await loadTeamRefinanceMonthlyStats(team.teamMonthlyStats, thisDate, thisDateToParse)
    let currentFirstRefinanceClosuresTeam = teamRefinanceMonthlyStats.currentFirstRefinanceClosuresTeam
    let currentSecondRefinanceClosuresTeam = teamRefinanceMonthlyStats.currentSecondRefinanceClosuresTeam
    let currentThirdRefinanceClosuresTeam = teamRefinanceMonthlyStats.currentThirdRefinanceClosuresTeam
    let previousFirstRefinanceClosuresTeam = teamRefinanceMonthlyStats.previousFirstRefinanceClosuresTeam
    let previousSecondRefinanceClosuresTeam = teamRefinanceMonthlyStats.previousSecondRefinanceClosuresTeam
    let previousThirdRefinanceClosuresTeam = teamRefinanceMonthlyStats.previousThirdRefinanceClosuresTeam
    let currentThirdGrossTeam = teamRefinanceMonthlyStats.currentThirdGrossTeam
    let currentSecondGrossTeam = teamRefinanceMonthlyStats.currentSecondGrossTeam
    let currentFirstGrossTeam = teamRefinanceMonthlyStats.currentFirstGrossTeam
    let previousThirdGrossTeam = teamRefinanceMonthlyStats.previousThirdGrossTeam
    let previousSecondGrossTeam = teamRefinanceMonthlyStats.previousSecondGrossTeam
    let previousFirstGrossTeam = teamRefinanceMonthlyStats.previousFirstGrossTeam
    let teamRefinanceMonthlyStatsAll = teamRefinanceMonthlyStats.teamRefinanceMonthlyStatsAll
    let teamRefinanceMonthlyStatsTwoYear = teamRefinanceMonthlyStats.teamRefinanceMonthlyStatsTwoYear
    let teamRefinanceMonthlyStatsOneYear = teamRefinanceMonthlyStats.teamRefinanceMonthlyStatsOneYear
    let teamRefinanceQuarterBreakdown = teamRefinanceMonthlyStats.teamRefinanceQuarterBreakdown

    let currentTeamRefinanceProgress = 0;
    let currentTeamRefinanceGross = Math.round(currentFirstGrossTeam + currentSecondGrossTeam + currentThirdGrossTeam);
    let previousTeamRefinanceGross = Math.round(previousThirdGrossTeam + previousSecondGrossTeam + previousFirstGrossTeam);
    let currentTeamRefinances = Math.round(currentFirstRefinanceClosuresTeam + currentSecondRefinanceClosuresTeam + currentThirdRefinanceClosuresTeam);
    let previousTeamRefinances = Math.round(previousFirstRefinanceClosuresTeam + previousSecondRefinanceClosuresTeam + previousThirdRefinanceClosuresTeam);
    if (previousTeamRefinanceGross === 0) {
      currentTeamRefinanceProgress = 'N/A'
    } else {
      currentTeamRefinanceProgress = (Math.round(((currentTeamRefinanceGross/previousTeamRefinanceGross) * 100)*10)/10);
    }
    if (currentTeamRefinanceGross > 99999 && currentTeamRefinanceGross < 999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000).toFixed(1)) + 'k'
    } else if (currentTeamRefinanceGross > 999999 && currentTeamRefinanceGross < 9999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000000).toFixed(3)) + 'm'
    } else if (currentTeamRefinanceGross > 9999999 && currentTeamRefinanceGross < 999999999) {
      currentTeamRefinanceGross = Math.sign(currentGcurrentTeamRefinanceGrossross)*((Math.abs(currentTeamRefinanceGross)/1000000).toFixed(2)) + 'm'
    } else if (currentTeamRefinanceGross > 999999999) {
      currentTeamRefinanceGross = Math.sign(currentTeamRefinanceGross)*((Math.abs(currentTeamRefinanceGross)/1000000000).toFixed(3)) + 't'
    }
    if (previousTeamRefinanceGross > 99999 && previousTeamRefinanceGross < 999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000).toFixed(1)) + 'k'
    } else if (previousTeamRefinanceGross > 999999 && previousTeamRefinanceGross < 9999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000000).toFixed(3)) + 'm'
    } else if (previousTeamRefinanceGross > 9999999 && previousTeamRefinanceGross < 999999999) {
      previousTeamRefinanceGross = Math.sign(previouspreviousTeamRefinanceGrossGross)*((Math.abs(previousTeamRefinanceGross)/1000000).toFixed(2)) + 'm'
    } else if (previousTeamRefinanceGross > 999999999) {
      previousTeamRefinanceGross = Math.sign(previousTeamRefinanceGross)*((Math.abs(previousTeamRefinanceGross)/1000000000).toFixed(3)) + 't'
    }
    teamRefinanceQuarterBreakdown.currentGross = currentTeamRefinanceGross;
    teamRefinanceQuarterBreakdown.previousGross = previousTeamRefinanceGross;
    teamRefinanceQuarterBreakdown.currentProgress = currentTeamRefinanceProgress;
    teamRefinanceQuarterBreakdown.currentRefinances = currentTeamRefinances;
    teamRefinanceQuarterBreakdown.previousRefinances = previousTeamRefinances;
    
    let teamMonthlyStats = {
      leadGeneration: {
        all: teamLeadGenerationAll,
        twoYear: teamLeadGenerationTwoYear,
        oneYear: teamLeadGenerationOneYear,
      },
      renegotiations: {
        quarterBreakdown: teamRenegotiationQuarterBreakdown,
        all: teamRenegotiationMonthlyStatsAll,
        twoYear: teamRenegotiationMonthlyStatsTwoYear,
        oneYear: teamRenegotiationMonthlyStatsOneYear
      },
      refinances: {
        quarterBreakdown: teamRefinanceQuarterBreakdown,
        all: teamRefinanceMonthlyStatsAll,
        twoYear: teamRefinanceMonthlyStatsTwoYear,
        oneYear: teamRefinanceMonthlyStatsOneYear
      },
      portfolioStats: {
        all: teamPortfolioMonthlyStatsAll,
        twoYear: teamPortfolioMonthlyStatsTwoYear,
        oneYear: teamPortfolioMonthlyStatsOneYear,
      }
    }

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'App Loaded', 'Load', [{}], 'success', false, user.fullName)

    if (user.role[0] === 'super') {
      sendApiSuccessResponse(res, {currentUserActionsRole, newLog, teamStats, teamAwaitingActionLeads, teamInvestigatingLeads, teamClosingLeads, teamAwaitingUpdateLeads, teamRefinanceClosures, teamRenegotiationClosures, mortgages, teamMonthlyStats, teamAndUserSettings, teamReports, membersDataArray, teamAdminData, sweepParameters, team, users, mortgageDataModel, memberAssignments, teamLeadsAwaitingUpdate, teamLeadsAwaitingVerification, userActionsPermissions, teamMembersData, showWelcomeModal, notificationsObj, superTagsViewMortgages}, 'load successful!');
      console.info('-----------------------------------')
      console.timeEnd('elapsed-time')
      console.info('-----------------------------------')
      console.info('*****************************************************')
      console.info('********* SUPER LOAD COMPLETED SUCCESSFULLY *********')
      console.info('*****************************************************')
      console.info('')
    } else {
      sendApiSuccessResponse(res, {currentUserActionsRole, teamStats, teamAwaitingActionLeads, teamInvestigatingLeads, teamClosingLeads, teamAwaitingUpdateLeads, teamRefinanceClosures, teamRenegotiationClosures, mortgages, teamMonthlyStats, teamAndUserSettings, teamReports, membersDataArray, teamAdminData, sweepParameters, memberAssignments, userActionsPermissions, teamMembersData, showWelcomeModal, mortgageDataModel, notificationsObj, teamLeadsAwaitingUpdate, teamLeadsAwaitingVerification}, 'load successful!');
      console.info('-----------------------------------')
      console.timeEnd('elapsed-time')
      console.info('-----------------------------------')
      console.info('*****************************************************')
      console.info('********* BASIC LOAD COMPLETED SUCCESSFULLY *********')
      console.info('*****************************************************')
      console.info('')
    }
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Initial Load', [{}], error, true, null)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { initialLoad }