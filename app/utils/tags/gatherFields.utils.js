

exports.gatherMortgageTagFields = async function (existingMortgageTags) {
  let existingMortgageTagBooleans = {
    ownerIsLLC: false,
    ownerIsLLP: false,
    ownerIsFLLP: false,
    ownerIsCorporation: false,
    ownerIsTrust: false,
    ownerIsRevocableTrust: false,
    ownerIsLivingTrust: false,
    ownerIsAssociation: false,
    miscEntityOwnerType: false,
    commercialProperty: false,
    residentialProperty: false,
    miscPropertyType: false,
    fixedRateAmortization: false,
    conventionalLoan: false,
    miscLoanType: false,
    taxInitialDelinquencyYear: false,
    reoFlag: false,
    distress: false,
    quitClaim: false,
    secondMortgage: false,
    ownerOccupied: false,
    taxExemptionStatus: false,
  }
  let existingMortgageTagFieldArrays = {
    ownerIsLLC: [],
    ownerIsLLP: [],
    ownerIsFLLP: [],
    ownerIsCorporation: [],
    ownerIsTrust: [],
    ownerIsRevocableTrust: [],
    ownerIsLivingTrust: [],
    ownerIsAssociation: [],
    miscEntityOwnerType: [],
    commercialProperty: [],
    residentialProperty: [],
    miscPropertyType: [],
    fixedRateAmortization: [],
    conventionalLoan: [],
    miscLoanType: [],
    taxInitialDelinquencyYear: [],
    reoFlag: [],
    distress: [],
    quitClaim: [],
    secondMortgage: [],
    ownerOccupied: [],
    taxExemptionStatus: [],
  }
  let ownerIsLLC = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsLLC')
  if (ownerIsLLC) {
    existingMortgageTagBooleans.ownerIsLLC = true
    existingMortgageTagFieldArrays.ownerIsLLC = ownerIsLLC.discrepancyFields
  }
  let ownerIsLLP = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsLLP')
  if (ownerIsLLP) {
    existingMortgageTagBooleans.ownerIsLLP = true
    existingMortgageTagFieldArrays.ownerIsLLP = ownerIsLLP.discrepancyFields
  }
  let ownerIsFLLP = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsFLLP')
  if (ownerIsFLLP) {
    existingMortgageTagBooleans.ownerIsFLLP = true
    existingMortgageTagFieldArrays.ownerIsFLLP = ownerIsFLLP.discrepancyFields
  }
  let ownerIsCorporation = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsCorporation')
  if (ownerIsCorporation) {
    existingMortgageTagBooleans.ownerIsCorporation = true
    existingMortgageTagFieldArrays.ownerIsCorporation = ownerIsCorporation.discrepancyFields
  }
  let ownerIsTrust = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsTrust')
  if (ownerIsTrust) {
    existingMortgageTagBooleans.ownerIsTrust = true
    existingMortgageTagFieldArrays.ownerIsTrust = ownerIsTrust.discrepancyFields
  }
  let ownerIsRevocableTrust = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsRevocableTrust')
  if (ownerIsRevocableTrust) {
    existingMortgageTagBooleans.ownerIsRevocableTrust = true
    existingMortgageTagFieldArrays.ownerIsRevocableTrust = ownerIsRevocableTrust.discrepancyFields
  }
  let ownerIsLivingTrust = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsLivingTrust')
  if (ownerIsLivingTrust) {
    existingMortgageTagBooleans.ownerIsLivingTrust = true
    existingMortgageTagFieldArrays.ownerIsLivingTrust = ownerIsLivingTrust.discrepancyFields
  }
  let ownerIsAssociation = existingMortgageTags.find(tag => tag.apiMapping === 'ownerIsAssociation')
  if (ownerIsAssociation) {
    existingMortgageTagBooleans.ownerIsAssociation = true
    existingMortgageTagFieldArrays.ownerIsAssociation = ownerIsAssociation.discrepancyFields
  }
  let miscEntityOwnerType = existingMortgageTags.find(tag => tag.apiMapping === 'miscEntityOwnerType')
  if (miscEntityOwnerType) {
    existingMortgageTagBooleans.miscEntityOwnerType = true
    existingMortgageTagFieldArrays.miscEntityOwnerType = miscEntityOwnerType.discrepancyFields
  }
  let commercialProperty = existingMortgageTags.find(tag => tag.apiMapping === 'commercialProperty')
  if (commercialProperty) {
    existingMortgageTagBooleans.commercialProperty = true
    existingMortgageTagFieldArrays.commercialProperty = commercialProperty.discrepancyFields
  }
  let residentialProperty = existingMortgageTags.find(tag => tag.apiMapping === 'residentialProperty')
  if (residentialProperty) {
    existingMortgageTagBooleans.residentialProperty = true
    existingMortgageTagFieldArrays.residentialProperty = residentialProperty.discrepancyFields
  }
  let miscPropertyType = existingMortgageTags.find(tag => tag.apiMapping === 'miscPropertyType')
  if (miscPropertyType) {
    existingMortgageTagBooleans.miscPropertyType = true
    existingMortgageTagFieldArrays.miscPropertyType = miscPropertyType.discrepancyFields
  }
  let conventionalLoan = existingMortgageTags.find(tag => tag.apiMapping === 'conventionalLoan')
  if (conventionalLoan) {
    existingMortgageTagBooleans.conventionalLoan = true
    existingMortgageTagFieldArrays.conventionalLoan = conventionalLoan.discrepancyFields
  }
  let miscLoanType = existingMortgageTags.find(tag => tag.apiMapping === 'miscLoanType')
  if (miscLoanType) {
    existingMortgageTagBooleans.miscLoanType = true
    existingMortgageTagFieldArrays.miscLoanType = miscLoanType.discrepancyFields
  }
  let taxInitialDelinquencyYear = existingMortgageTags.find(tag => tag.apiMapping === 'taxInitialDelinquencyYear')
  if (taxInitialDelinquencyYear) {
    existingMortgageTagBooleans.taxInitialDelinquencyYear = true
    existingMortgageTagFieldArrays.taxInitialDelinquencyYear = taxInitialDelinquencyYear.discrepancyFields
  }
  let reoFlag = existingMortgageTags.find(tag => tag.apiMapping === 'reoFlag')
  if (reoFlag) {
    existingMortgageTagBooleans.reoFlag = true
    existingMortgageTagFieldArrays.reoFlag = reoFlag.discrepancyFields
  }
  let distress = existingMortgageTags.find(tag => tag.apiMapping === 'distress')
  if (distress) {
    existingMortgageTagBooleans.distress = true
    existingMortgageTagFieldArrays.distress = distress.discrepancyFields
  }
  let quitClaim = existingMortgageTags.find(tag => tag.apiMapping === 'quitClaim')
  if (quitClaim) {
    existingMortgageTagBooleans.quitClaim = true
    existingMortgageTagFieldArrays.quitClaim = quitClaim.discrepancyFields
  }
  let secondMortgage = existingMortgageTags.find(tag => tag.apiMapping === 'secondMortgage')
  if (secondMortgage) {
    existingMortgageTagBooleans.secondMortgage = true
    existingMortgageTagFieldArrays.secondMortgage = secondMortgage.discrepancyFields
  }
  let ownerOccupied = existingMortgageTags.find(tag => tag.apiMapping === 'ownerOccupied')
  if (ownerOccupied) {
    existingMortgageTagBooleans.ownerOccupied = true
    existingMortgageTagFieldArrays.ownerOccupied = ownerOccupied.discrepancyFields
  }
  let taxExemptionStatus = existingMortgageTags.find(tag => tag.apiMapping === 'taxExemptionStatus')
  if (taxExemptionStatus) {
    existingMortgageTagBooleans.taxExemptionStatus = true
    existingMortgageTagFieldArrays.taxExemptionStatus = taxExemptionStatus.discrepancyFields
  }

  return {existingMortgageTagBooleans, existingMortgageTagFieldArrays}
}

exports.gatherLeadTagFields = async function (existingLeadTags) {
  let existingLeadTagBooleans = {
    assessment: false,
    transfer: false,
    distress: false,
    subdivision: false,
    rezoning: false,
    improvements: false,
    addSubUnits: false,
    taxExemptions: false,
    newMortgage: false,
    newOwnerIsLLC: false,
    newOwnerIsLLP: false,
    newOwnerIsFLLP: false,
    newOwnerIsCorporation: false,
    newOwnerIsTrust: false,
    newOwnerIsRevocableTrust: false,
    newOwnerIsLivingTrust: false,
    newOwnerIsAssociation: false,
    miscEntityNewOwnerType: false,
  }
  let existingLeadTagFieldArrays = {
    assessment: [],
    transfer: [],
    distress: [],
    subdivision: [],
    rezoning: [],
    improvements: [],
    addSubUnits: [],
    taxExemptions: [],
    newMortgage: [],
    newOwnerIsLLC: [],
    newOwnerIsLLP: [],
    newOwnerIsFLLP: [],
    newOwnerIsCorporation: [],
    newOwnerIsTrust: [],
    newOwnerIsRevocableTrust: [],
    newOwnerIsLivingTrust: [],
    newOwnerIsAssociation: [],
    miscEntityNewOwnerType: [],
  }
  let assessmentTag = existingLeadTags.find(tag => tag.apiMapping === 'assessment')
  if (assessmentTag) {
    existingLeadTagBooleans.assessment = true
    existingLeadTagFieldArrays.assessment = assessmentTag.discrepancyFields
  }
  let transferTag = existingLeadTags.find(tag => tag.apiMapping === 'transfer')
  if (transferTag) {
    existingLeadTagBooleans.transfer = true
    existingLeadTagFieldArrays.transfer = transferTag.discrepancyFields
  }
  let distressTag = existingLeadTags.find(tag => tag.apiMapping === 'distress')
  if (distressTag) {
    existingLeadTagBooleans.distress = true
    existingLeadTagFieldArrays.distress = distressTag.discrepancyFields
  }
  let subdivisionTag = existingLeadTags.find(tag => tag.apiMapping === 'subdivision')
  if (subdivisionTag) {
    existingLeadTagBooleans.subdivision = true
    existingLeadTagFieldArrays.subdivision = subdivisionTag.discrepancyFields
  }
  let rezoningTag = existingLeadTags.find(tag => tag.apiMapping === 'rezoning')
  if (rezoningTag) {
    existingLeadTagBooleans.rezoning = true
    existingLeadTagFieldArrays.rezoning = rezoningTag.discrepancyFields
  }
  let improvementsTag = existingLeadTags.find(tag => tag.apiMapping === 'improvements')
  if (improvementsTag) {
    existingLeadTagBooleans.improvements = true
    existingLeadTagFieldArrays.improvements = improvementsTag.discrepancyFields
  }
  let addSubUnitsTag = existingLeadTags.find(tag => tag.apiMapping === 'addSubUnits')
  if (addSubUnitsTag) {
    existingLeadTagBooleans.addSubUnits = true
    existingLeadTagFieldArrays.addSubUnits = addSubUnitsTag.discrepancyFields
  }
  let taxExemptionStatusTag = existingLeadTags.find(tag => tag.apiMapping === 'taxExemptionStatus')
  if (taxExemptionStatusTag) {
    existingLeadTagBooleans.taxExemptions = true
    existingLeadTagFieldArrays.taxExemptions = taxExemptionStatusTag.discrepancyFields
  }
  let newMortgageTag = existingLeadTags.find(tag => tag.apiMapping === 'newMortgage')
  if (newMortgageTag) {
    existingLeadTagBooleans.newMortgage = true
    existingLeadTagFieldArrays.newMortgage = newMortgageTag.discrepancyFields
  }
  let newOwnerIsLLCTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsLLC')
  if (newOwnerIsLLCTag) {
    existingLeadTagBooleans.newOwnerIsLLC = true
    existingLeadTagFieldArrays.newOwnerIsLLC = newOwnerIsLLCTag.discrepancyFields
  }
  let newOwnerIsLLPTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsLLP')
  if (newOwnerIsLLPTag) {
    existingLeadTagBooleans.newOwnerIsLLP = true
    existingLeadTagFieldArrays.newOwnerIsLLP = newOwnerIsLLPTag.discrepancyFields
  }
  let newOwnerIsFLLPTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsFLLP')
  if (newOwnerIsFLLPTag) {
    existingLeadTagBooleans.newOwnerIsFLLP = true
    existingLeadTagFieldArrays.newOwnerIsFLLP = newOwnerIsFLLPTag.discrepancyFields
  }
  let newOwnerIsCorporationTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsCorporation')
  if (newOwnerIsCorporationTag) {
    existingLeadTagBooleans.newOwnerIsCorporation = true
    existingLeadTagFieldArrays.newOwnerIsCorporation = newOwnerIsCorporationTag.discrepancyFields
  }
  let newOwnerIsTrustTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsTrust')
  if (newOwnerIsTrustTag) {
    existingLeadTagBooleans.newOwnerIsTrust = true
    existingLeadTagFieldArrays.newOwnerIsTrust = newOwnerIsTrustTag.discrepancyFields
  }
  let newOwnerIsRevocableTrustTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsRevocableTrust')
  if (newOwnerIsRevocableTrustTag) {
    existingLeadTagBooleans.newOwnerIsRevocableTrust = true
    existingLeadTagFieldArrays.newOwnerIsRevocableTrust = newOwnerIsRevocableTrustTag.discrepancyFields
  }
  let newOwnerIsLivingTrustTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsLivingTrust')
  if (newOwnerIsLivingTrustTag) {
    existingLeadTagBooleans.newOwnerIsLivingTrust = true
    existingLeadTagFieldArrays.newOwnerIsLivingTrust = newOwnerIsLivingTrustTag.discrepancyFields
  }
  let newOwnerIsAssociationTag = existingLeadTags.find(tag => tag.apiMapping === 'newOwnerIsAssociation')
  if (newOwnerIsAssociationTag) {
    existingLeadTagBooleans.newOwnerIsAssociation = true
    existingLeadTagFieldArrays.newOwnerIsAssociation = newOwnerIsAssociationTag.discrepancyFields
  }
  let miscEntityNewOwnerTypeTag = existingLeadTags.find(tag => tag.apiMapping === 'miscEntityNewOwnerType')
  if (miscEntityNewOwnerTypeTag) {
    existingLeadTagBooleans.miscEntityNewOwnerType = true
    existingLeadTagFieldArrays.miscEntityNewOwnerType = miscEntityNewOwnerTypeTag.discrepancyFields
  }

  return {existingLeadTagBooleans, existingLeadTagFieldArrays}
}