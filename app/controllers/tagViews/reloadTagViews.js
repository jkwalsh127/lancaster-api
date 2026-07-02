const moment = require('moment');
const TeamModel = require('../../models/team');
const { nanoid } = require('nanoid');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const MortgageTagModel = require('../../models/mortgageTag');
const { notifyAssignees } = require('../../utils/notifyAssignees.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { RequestValidation } = require('../RequestValidation');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function reloadTagViews(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info("*** Reloading Tag Views")
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let team = await TeamModel.findById(req.body.teamId).populate('mortgages', 'tags _id').select("mortgages")
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
      conventionalLoanMortgagesObj,
      secondMortgageMortgagesObj,
      taxInitialDelinquencyYearMortgagesObj,
      reoFlagMortgagesObj,
      distressMortgagesObj,
      quitClaimMortgagesObj,
      ownerOccupiedMortgagesObj,
      taxExemptionStatusMortgagesObj,
    ]
    if (req.body.userRole === 'super') {
      superTagsViewMortgages = [
        miscEntityOwnerTypeMortgagesObj,
        miscPropertyTypeMortgagesObj,
        miscLoanTypeMortgagesObj,
      ]
    }

    sendApiSuccessResponse(res, {tagsViewMortgages, superTagsViewMortgages}, 'tag views reload successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Add Mortgage Tag', [{}], error, true, null)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { reloadTagViews }