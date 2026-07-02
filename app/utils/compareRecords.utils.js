const moment = require('moment')
const SweepParameterModel = require("../models/sweepParameter");
const { updateMortgageTagFields, updateLeadTagFields } = require('./tags/updateFields.utils');

exports.compareRecords = async function (mappedVendorObj, existingMortgageRecords, sweepParameters, activeLeadTier, querySettings, teamLeadTags, teamMortgageTags, leadAwaitingUpdates, mortgageHasActiveLead, existingLeadTags, existingLeadTagFieldArrays, existingMortgageTagFieldArrays, isInitialMatch, skipNewVendorRejections, skipMissingVendorRejections) {
  let createNew = false
  let newOwner1 = false
  let newOwner2 = false
  let leadUpdated = false
  let totalUpdated = false
  let ownerIsTrust = false
  let newTier2Count = false
  let newTier1Count = false
  let ownerTrustName = ''
  let newOwnerDetails = {}
  let newRecordDetails = existingMortgageRecords
  let newTaxInformation = {}
  let updatedTier1Count = false
  let updatedTier2Count = false
  let newOwner1FullName = ''
  let newOwner2FullName = ''
  let ownerAccountedFor = false
  let leadTierAssignment = 10
  let totalInactiveLeads = false
  let totalNewTier1Leads = false
  let totalNewTier2Leads = false
  let upgradedTier2Count = false
  let emptyInteralRecords = false
  let discrepancyDetected = false
  let loanTypeAccountedFor = false
  let publicRecordsUpdated = false
  let llcOwnerAccountedFor = false
  let mortgageDiscrepancies = 0
  let newTier1Discrepancies = []
  let newTier2Discrepancies = []
  let newTier3Discrepancies = []
  let leadOwnerAccountedFor = false
  let newTaxInformationBool = false
  let leadsWithUpgradedTiers = false
  let newRejectedDiscrepancies = 0
  let newResolvedDiscrepancies = 0
  let newOriginalDiscrepancies = []
  let newAssessmentInformation = {}
  let llcLeadOwnerAccountedFor = false
  let propertyTypeAccountedFor = false
  let assessmentValueDifference = 0
  let updatedTier1Discrepancies = []
  let updatedTier2Discrepancies = []
  let updatedTier3Discrepancies = []
  let resolvedTier1Discrepancies = []
  let resolvedTier2Discrepancies = []
  let resolvedTier3Discrepancies = []
  let revocableOwnerAccountedFor = false
  let mortgageTier1Discrepancies = 0
  let mortgageTier2Discrepancies = 0
  let mortgageTier3Discrepancies = 0
  let leadActiveDiscrepancyCount = 0
  let previousLeadTierAssignment = activeLeadTier
  let newAssessmentInformationBool = false
  let revocableLeadOwnerAccountedFor = false
  let recordUpdatesDontMatchEntirely = false
  let mortgageTagUpdatedBooleans = {
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
  let leadTagUpdatedBooleans = {
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

  if (previousLeadTierAssignment || previousLeadTierAssignment === 0) {
    leadTierAssignment = previousLeadTierAssignment
  }

  //* first, loop through the mortgage record fields
  for (let j = 0; j < Object.entries(mappedVendorObj).length; j++) {
    for (let k = 0; k < Object.entries(Object.entries(existingMortgageRecords)[j][1]).length; k++) {
      let baseAPIMapping = (Object.entries(mappedVendorObj)[j][0])
      let highestAPIMapping = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][0]
      let mortgageCurrentValue = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].currentValue
      let mortgageDiscrepancy = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].discrepancy
      let mortgageRecordLabel = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].label
      let mortgageRecordStatus = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].status
      let mortgageRecordOriginal = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].originalValue
      let mortgagePRValue = Object.entries(Object.entries(existingMortgageRecords)[j][1])[k][1].publicRecordValue

      let prBackup = (Object.entries(Object.entries(mappedVendorObj)[j][1]))[k][1].backup
      let prDiscrepancy = (Object.entries(Object.entries(mappedVendorObj)[j][1]))[k][1].discrepancy
      let publicRecordValue = (Object.entries(Object.entries(mappedVendorObj)[j][1]))[k][1].publicRecordValue
      if (!publicRecordValue) {
        publicRecordValue = ''
      }
      
      if (highestAPIMapping === 'PrimaryMortgageStartDate' || highestAPIMapping === 'PrimaryMortgageDueDate' || highestAPIMapping === 'SecondaryMortgageRecordingDate' || highestAPIMapping === 'SecondaryMortgageDueDate' || highestAPIMapping === 'LastSaleContractDate' || highestAPIMapping === 'LastSaleDate' || highestAPIMapping === 'LastSaleRecordingDate') {
        if (!publicRecordValue) {
          publicRecordValue = ''
        } else if (publicRecordValue.length > 0 && publicRecordValue.trim().length !== 13 && publicRecordValue.trim().length !== 14) {
          publicRecordValue = moment(publicRecordValue).format("MMM Do, YYYY")
        }
        if (!mortgageRecordOriginal) {
          mortgageRecordOriginal = ''
        } else if (mortgageRecordOriginal.length > 0 && mortgageRecordOriginal.trim().length !== 13 && mortgageRecordOriginal.trim().length !== 14) {
          mortgageRecordOriginal = moment(mortgageRecordOriginal).format("MMM Do, YYYY")
        }
        if (!mortgageCurrentValue) {
          mortgageCurrentValue = ''
        } else if (mortgageCurrentValue.length > 0 && mortgageCurrentValue.trim().length !== 13 && mortgageCurrentValue.trim().length !== 14) {
          mortgageCurrentValue = moment(mortgageCurrentValue).format("MMM Do, YYYY")
        }
        if (!mortgagePRValue) {
          mortgagePRValue = ''
        } else if (mortgagePRValue.length > 0 && mortgagePRValue.trim().length !== 13 && mortgagePRValue.trim().length !== 14) {
          mortgagePRValue = moment(mortgagePRValue).format("MMM Do, YYYY")
        }
      } else if (highestAPIMapping === 'AssessedYear' || highestAPIMapping === 'AssessedValue' || highestAPIMapping === 'AssessedLandValue' || highestAPIMapping === 'AssessedImprovementValue') {
        assessmentValueDifference = parseFloat(publicRecordValue) - parseFloat(mortgageCurrentValue)
        if (highestAPIMapping === 'AssessedYear') {
          newAssessmentInformation.newAssessedYear = publicRecordValue
          newAssessmentInformation.oldAssessedYear = mortgageCurrentValue
        } else if (highestAPIMapping === 'AssessedValue') {
          newAssessmentInformation.newAssessedValue = publicRecordValue
          newAssessmentInformation.oldAssessedValue = mortgageCurrentValue
        } else if (highestAPIMapping === 'AssessedLandValue') {
          newAssessmentInformation.newAssessedLandValue = publicRecordValue
          newAssessmentInformation.oldAssessedLandValue = mortgageCurrentValue
        } else {
          newAssessmentInformation.newAssessedImprovementValue = publicRecordValue
          newAssessmentInformation.oldAssessedImprovementValue = mortgageCurrentValue
        }
        newAssessmentInformationBool = true
        mortgageCurrentValue = publicRecordValue
        mortgagePRValue = publicRecordValue
        mortgageRecordOriginal = publicRecordValue
      } else if (highestAPIMapping === 'TaxYear' || highestAPIMapping === 'TaxAnnualAmount') {
        if (highestAPIMapping === 'TaxYear') {
          newTaxInformation.newTaxYear = publicRecordValue
          newTaxInformation.oldTaxYear = mortgageCurrentValue
        } else {
          newTaxInformation.newTaxAnnualAmount = publicRecordValue
          newTaxInformation.oldTaxAnnualAmount = mortgageCurrentValue
        }
        newTaxInformationBool = true
        mortgageCurrentValue = publicRecordValue
        mortgagePRValue = publicRecordValue
        mortgageRecordOriginal = publicRecordValue
      }

      // if (highestAPIMapping === 'Owner1FullName' || highestAPIMapping === 'Owner1LastName' || highestAPIMapping === 'Owner1FirstName' || highestAPIMapping === 'Owner2FullName' || highestAPIMapping === 'Owner2LastName' || highestAPIMapping === 'Owner2FirstName') {
      //   let includesRevocableTrust = publicRecordValue.toUpperCase().includes('REVOCABLE')
      //   let includesRevocTrust = publicRecordValue.toUpperCase().includes('REVOC')
      //   if (includesRevocableTrust || includesRevocTrust) {
      //     ownerIsTrust = false
      //     ownerIsRevocableTrust = true
      //     ownerIsRevocableTrustName = publicRecordValue
      //   } else if (!ownerIsRevocableTrust) {
      //     let includesTrust = publicRecordValue.toUpperCase().includes('TRUST')
      //     let includesTr = publicRecordValue.toUpperCase().includes(' TR ')
      //     let includesTrEnd = publicRecordValue.toUpperCase().endsWith(' TR')
      //     if (includesTrust || includesTr || includesTrEnd) {
      //       ownerIsTrust = true
      //       ownerTrustName = publicRecordValue
      //     }
      //   }
      // }

      if (typeof publicRecordValue === 'number') {
        if (typeof mortgageCurrentValue !== 'number') {
          mortgageCurrentValue = parseFloat(mortgageCurrentValue)
        }
      }
      if (typeof mortgageCurrentValue === 'number') {
        if (typeof mortgageCurrentValue !== 'number') {
          publicRecordValue = parseFloat(publicRecordValue)
        }
      }

      // if (highestAPIMapping === 'UnitPrefix') {
      //   publicRecordValue = '15'
      // }
      // if (highestAPIMapping === 'StreetNumber') {
      //   publicRecordValue = '2733'
      // }
      // if (highestAPIMapping === 'UnitNumber') {
      //   publicRecordValue = '10'
      // }
      // if (highestAPIMapping === 'StreetDirPrefix') {
      //   publicRecordValue = 'SW'
      // }
      // if (highestAPIMapping === 'StreetName') {
      //   publicRecordValue = "CAZADEROS"
      // }
      // if (highestAPIMapping === 'StreetSuffix') {
      //   publicRecordValue = "HWY"
      // }
      // if (highestAPIMapping === 'City') {
      //   publicRecordValue = null
      // }
      // if (highestAPIMapping === 'StateOrProvince') {
      //   publicRecordValue = null
      // }

      //* determine if the current mortgage field is a Sweep parameter, and which tier
      //* if yes, add as new discrpancy and define lead tier
      let sweepParameter = true
      let matchedTierParameter = {}
      let parameterField = sweepParameters.find(parameter => parameter.apiMapping === highestAPIMapping)
      if (!parameterField) {
        sweepParameter = false
      } else {
        matchedTierParameter = parameterField
      }
      let matchedTierInt = 0
      if (matchedTierParameter.assignedTier === 'one') {
        matchedTierInt = 1
      } else if (matchedTierParameter.assignedTier === 'two') {
        matchedTierInt = 2
      } else if (matchedTierParameter.assignedTier === 'three') {
        matchedTierInt = 3
      }

      //* check to see
      //* if the public records were updated from a previous time
      //* if the mortgage and public record details disagree, or 
      //* if the public record has a null value, or
      //* if there isn't an existing discrepancy on the field
      let continueParsing = true
      let discrepancyUpdated = false
      if (mortgagePRValue !== publicRecordValue) {
        if (publicRecordValue !== mortgageCurrentValue && (publicRecordValue !== null && publicRecordValue.length !== 0)) {
          recordUpdatesDontMatchEntirely = true
        }
        //* Check to see if empty internal records, so that mortgage tags could be applied (only time mortgage tags are applied from sweep)
        if (!mortgageCurrentValue || mortgageCurrentValue.length === 0) {
          emptyInteralRecords = true
        }
        if ((publicRecordValue === null || publicRecordValue.length === 0) && isInitialMatch === 'false') {
          continueParsing = false
        } else if (leadAwaitingUpdates) {
          publicRecordsUpdated = true
        }
        if (skipNewVendorRejections) {
          continueParsing = false
        }
        if (mortgageRecordStatus === 'discrepancy' && publicRecordValue !== mortgageCurrentValue) {
          discrepancyUpdated = true
        }
        //* Ignore discrepancy if this is a difference in capitalization
        //* -> update publicRecordValue to retain capitalized formatting
        if (typeof mortgagePRValue === 'string' && typeof publicRecordValue === 'string') {
          if (mortgagePRValue.trim().toUpperCase() === publicRecordValue.trim().toUpperCase()) {
            continueParsing = false
            publicRecordValue = publicRecordValue.toUpperCase()
          }
        }
      } else if (mortgageCurrentValue === publicRecordValue) {
        continueParsing = false
      } else if (mortgageRecordStatus === 'edited' && (publicRecordValue === null || publicRecordValue.length === 0)) {
        continueParsing = false
      } else if (mortgageRecordStatus === 'edited') {
        continueParsing = false
      }

      if (continueParsing) {
        //* Handle field-specific formatting
        //* check to see if new owners are detected
        if (highestAPIMapping === 'Owner1FullName') {
          if (publicRecordValue) {
            newOwner1 = true
            newOwner1FullName = publicRecordValue
            newOwnerDetails.newOwner1FullName = publicRecordValue
            newOwnerDetails.oldOwner1FullName = mortgageCurrentValue
          }
        } else if (highestAPIMapping === 'Owner2FullName') {
          if (publicRecordValue) {
            newOwner2 = true
            newOwner2FullName = publicRecordValue
            newOwnerDetails.newOwner2FullName = publicRecordValue
            newOwnerDetails.oldOwner2FullName = mortgageCurrentValue
          }
        }
        if (querySettings.createLead === 'true') {
          let leadTagUpdates = await updateLeadTagFields(highestAPIMapping, teamLeadTags, existingLeadTagFieldArrays, publicRecordValue)
          leadOwnerAccountedFor = leadTagUpdates.ownerAccountedFor
          llcLeadOwnerAccountedFor = leadTagUpdates.llcLeadOwnerAccountedFor
          revocableLeadOwnerAccountedFor = leadTagUpdates.revocableOwnerAccountedFor
          existingLeadTagFieldArrays = leadTagUpdates.existingLeadTagFieldArrays
          if (leadOwnerAccountedFor) {
            leadTagUpdatedBooleans.miscEntityNewOwnerType = false
            leadTagFieldArrays.miscEntityNewOwnerType = []
          }
          if (revocableLeadOwnerAccountedFor) {
            leadTagUpdatedBooleans.newOwnerIsTrust = false
            leadTagFieldArrays.newOwnerIsTrust = []
          }
          if (llcLeadOwnerAccountedFor) {
            leadTagUpdatedBooleans.newOwnerIsAssociation = false
            leadTagFieldArrays.newOwnerIsAssociation = []
          }
          if (leadTagUpdates.leadTagUpdatedBooleans.assessment) {
            leadTagUpdatedBooleans.assessment = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.transfer) {
            leadTagUpdatedBooleans.transfer = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.distress) {
            leadTagUpdatedBooleans.distress = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.subdivision) {
            leadTagUpdatedBooleans.subdivision = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.rezoning) {
            leadTagUpdatedBooleans.rezoning = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.improvements) {
            leadTagUpdatedBooleans.improvements = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.addSubUnits) {
            leadTagUpdatedBooleans.addSubUnits = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.taxExemptions) {
            leadTagUpdatedBooleans.taxExemptions = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newMortgage) {
            leadTagUpdatedBooleans.newMortgage = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsLLC) {
            leadTagUpdatedBooleans.newOwnerIsLLC = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsLLP) {
            leadTagUpdatedBooleans.newOwnerIsLLP = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsFLLP) {
            leadTagUpdatedBooleans.newOwnerIsFLLP = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsCorporation) {
            leadTagUpdatedBooleans.newOwnerIsCorporation = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsTrust) {
            leadTagUpdatedBooleans.newOwnerIsTrust = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsRevocableTrust) {
            leadTagUpdatedBooleans.newOwnerIsRevocableTrust = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsLivingTrust) {
            leadTagUpdatedBooleans.newOwnerIsLivingTrust = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsAssociation) {
            leadTagUpdatedBooleans.newOwnerIsAssociation = true
          } else if (leadTagUpdates.leadTagUpdatedBooleans.miscEntityNewOwnerType) {
            leadTagUpdatedBooleans.miscEntityNewOwnerType = true
          }
          if (leadTagUpdates.leadTagUpdatedBooleans.transfer) {
            leadTagUpdatedBooleans.transfer = true
          }
        }
        if (emptyInteralRecords) {
          let mortgageTagUpdates = await updateMortgageTagFields(highestAPIMapping, teamMortgageTags, existingMortgageTagFieldArrays, publicRecordValue, ownerAccountedFor, revocableOwnerAccountedFor, llcOwnerAccountedFor, loanTypeAccountedFor, propertyTypeAccountedFor)
          ownerAccountedFor = mortgageTagUpdates.ownerAccountedFor
          loanTypeAccountedFor = mortgageTagUpdates.loanTypeAccountedFor
          llcOwnerAccountedFor = mortgageTagUpdates.llcOwnerAccountedFor
          propertyTypeAccountedFor = mortgageTagUpdates.propertyTypeAccountedFor
          revocableOwnerAccountedFor = mortgageTagUpdates.revocableOwnerAccountedFor
          existingMortgageTagFieldArrays = mortgageTagUpdates.existingMortgageTagFieldArrays
          if (ownerAccountedFor) {
            mortgageTagUpdatedBooleans.miscEntityOwnerType = false
            existingMortgageTagFieldArrays.miscEntityOwnerType = []
          }
          if (revocableOwnerAccountedFor) {
            mortgageTagUpdatedBooleans.ownerIsTrust = false
            existingMortgageTagFieldArrays.ownerIsTrust = []
          }
          if (llcOwnerAccountedFor) {
            mortgageTagUpdatedBooleans.ownerIsAssociation = false
            existingMortgageTagFieldArrays.ownerIsAssociation = []
          }
          if (loanTypeAccountedFor) {
            mortgageTagUpdatedBooleans.miscLoanType = false
            existingMortgageTagFieldArrays.miscLoanType = []
          }
          if (propertyTypeAccountedFor) {
            mortgageTagUpdatedBooleans.miscPropertyType = false
            existingMortgageTagFieldArrays.miscPropertyType = []
          }
          if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsLLC) {
            mortgageTagUpdatedBooleans.ownerIsLLC = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsLLP) {
            mortgageTagUpdatedBooleans.ownerIsLLP = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsFLLP) {
            mortgageTagUpdatedBooleans.ownerIsFLLP = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsCorporation) {
            mortgageTagUpdatedBooleans.ownerIsCorporation = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsTrust) {
            mortgageTagUpdatedBooleans.ownerIsTrust = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsRevocableTrust) {
            mortgageTagUpdatedBooleans.ownerIsRevocableTrust = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsLivingTrust) {
            mortgageTagUpdatedBooleans.ownerIsLivingTrust = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerIsAssociation) {
            mortgageTagUpdatedBooleans.ownerIsAssociation = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.miscEntityOwnerType) {
            mortgageTagUpdatedBooleans.miscEntityOwnerType = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.commercialProperty) {
            mortgageTagUpdatedBooleans.commercialProperty = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.residentialProperty) {
            mortgageTagUpdatedBooleans.residentialProperty = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.miscPropertyType) {
            mortgageTagUpdatedBooleans.miscPropertyType = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.conventionalLoan) {
            mortgageTagUpdatedBooleans.conventionalLoan = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.miscLoanType) {
            mortgageTagUpdatedBooleans.miscLoanType = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.taxInitialDelinquencyYear) {
            mortgageTagUpdatedBooleans.taxInitialDelinquencyYear = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.reoFlag) {
            mortgageTagUpdatedBooleans.reoFlag = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.distress) {
            mortgageTagUpdatedBooleans.distress = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.quitClaim) {
            mortgageTagUpdatedBooleans.quitClaim = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.secondMortgage) {
            mortgageTagUpdatedBooleans.secondMortgage = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.ownerOccupied) {
            mortgageTagUpdatedBooleans.ownerOccupied = true
          } else if (mortgageTagUpdates.mortgageTagUpdatedBooleans.taxExemptionStatus) {
            mortgageTagUpdatedBooleans.taxExemptionStatus = true
          }
        }

        if (mortgageRecordStatus === 'discrepancy' && publicRecordValue !== mortgageCurrentValue) {
          createNew = false
        } else {
          createNew = true
        }
        if (mortgageDiscrepancy !== 'active') {
          leadUpdated = true
        }
        discrepancyDetected = true
        if (leadTierAssignment > matchedTierInt) {
          if (matchedTierInt === 3) {
            leadTierAssignment = 3
          } else if (matchedTierInt === 2) {
            leadTierAssignment = 2
          } else if (matchedTierInt === 1) {
            leadTierAssignment = 1
          }
        }
        let newDiscrepancy = 'active'
        let newStatus = 'discrepancy'
        let newTier = 'zero'
        let newOriginalValue = mortgageRecordOriginal
        let newCurrentValue = mortgageCurrentValue
        let newOriginalDiscrepancy = false
        let discrepancyResolved = false
        if (sweepParameter) {
          newTier = matchedTierParameter.assignedTier
          if (isInitialMatch !== 'true') {
            await SweepParameterModel.findByIdAndUpdate((matchedTierParameter._id), {
              $inc: { discrepancies: 1 },
            }, {new: true})
          }
        } else if (isInitialMatch !== 'true') {
          newTier = 'three'
        }
        if (isInitialMatch === 'true') {
          newDiscrepancy = 'inactive'
          newStatus = 'initial'
          newOriginalValue = publicRecordValue
          newCurrentValue = publicRecordValue
        } else {
          if (mortgageRecordStatus !== 'discrepancy') {
            if (mortgageRecordStatus === 'edited') {
              if (mortgageDiscrepancy === 'resolved') {
                newResolvedDiscrepancies--
              } else if (mortgageDiscrepancy !== 'provided') {
                newRejectedDiscrepancies--
              }
            } else if (mortgageRecordStatus === 'inactive') {
              if (mortgageDiscrepancy === 'resolved') {
                newResolvedDiscrepancies--
              }
            }
            if (mortgageCurrentValue !== publicRecordValue) {
              newOriginalDiscrepancy = true
              leadActiveDiscrepancyCount++
            } else {
              if (previousLeadTierAssignment) {
                newResolvedDiscrepancies++
                newDiscrepancy = 'resolved'
              } else {
                newDiscrepancy = 'inactive'
              }
              discrepancyResolved = true
              newStatus = 'inactive'
            }
            mortgageDiscrepancies++
          } else if (mortgageRecordStatus === 'edited') {
            if (mortgageDiscrepancy === 'resolved') {
              newResolvedDiscrepancies--
            } else {
              newRejectedDiscrepancies--
            }
            leadActiveDiscrepancyCount++
            mortgageDiscrepancies++
            newOriginalDiscrepancy = true
          } else if (mortgageRecordStatus === 'discrepancy') {
            if (mortgageCurrentValue === publicRecordValue) {
              leadActiveDiscrepancyCount--
              discrepancyResolved = true
              newResolvedDiscrepancies++
              newDiscrepancy = 'resolved'
              newStatus = 'inactive'
            } else {
              mortgageDiscrepancies++
            }
            newOriginalDiscrepancy = true
          }
          if (sweepParameter) {
            if (matchedTierParameter.assignedTier === 'three') {
              mortgageTier3Discrepancies++
              if (discrepancyResolved) {
                resolvedTier3Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (discrepancyUpdated) {
                updatedTier3Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (mortgageRecordStatus !== 'discrepancy') {
                newOriginalDiscrepancies.push(matchedTierParameter.apiMapping)
                newTier3Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              }
            } else if (matchedTierParameter.assignedTier === 'two') {
              mortgageTier2Discrepancies++
              if (discrepancyResolved) {
                resolvedTier2Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (discrepancyUpdated) {
                updatedTier2Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (mortgageRecordStatus !== 'discrepancy') {
                newOriginalDiscrepancies.push(matchedTierParameter.apiMapping)
                newTier2Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              }
            } else if (matchedTierParameter.assignedTier === 'one') {
              mortgageTier1Discrepancies++
              if (discrepancyResolved) {
                resolvedTier1Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (discrepancyUpdated) {
                updatedTier1Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              } else if (mortgageRecordStatus !== 'discrepancy') {
                newOriginalDiscrepancies.push(matchedTierParameter.apiMapping)
                newTier1Discrepancies.push({
                  label: matchedTierParameter.label,
                  originalValue: mortgageCurrentValue,
                  publicRecordValue: publicRecordValue,
                })
              }
            }
          } else {
            mortgageTier3Discrepancies++
            if (discrepancyResolved) {
              resolvedTier3Discrepancies.push({
                label: matchedTierParameter.label,
                originalValue: mortgageCurrentValue,
                publicRecordValue: publicRecordValue,
              })
            } else if (discrepancyUpdated) {
              updatedTier3Discrepancies.push({
                label: mortgageRecordLabel,
                originalValue: mortgageCurrentValue,
                publicRecordValue: publicRecordValue,
              })
            } else if (mortgageRecordStatus !== 'discrepancy') {
              newTier3Discrepancies.push({
                label: mortgageRecordLabel,
                originalValue: mortgageCurrentValue,
                publicRecordValue: publicRecordValue,
              })
            }
          }
        }
        if (!publicRecordValue) {
          newOriginalValue = mortgageRecordOriginal
          newCurrentValue = mortgageCurrentValue
        }
        newRecordDetails[baseAPIMapping][highestAPIMapping] = {
          prBackup: prBackup,
          prDiscrepancy: prDiscrepancy,
          discrepancy: newDiscrepancy,
          status: newStatus,
          label: mortgageRecordLabel,
          assignedTier: newTier,
          originalValue: newOriginalValue,
          publicRecordValue: publicRecordValue,
          currentValue: newCurrentValue,
          originalDiscrepancy: newOriginalDiscrepancy,
        }
      } else {
        //* the records agree and public records were not updated, record the current state and define the tier
        let newTier = 0
        if (matchedTierParameter) {
          newTier = matchedTierParameter.assignedTier
        } else {
          newTier = 'zero'
        }
        let newStatus = mortgageRecordStatus
        if (newStatus === 'initial') {
          newStatus = 'inactive'
        } else if (!newStatus) {
          newStatus = 'initial'
        }
        let newDiscrepancy = mortgageDiscrepancy
        if (!newDiscrepancy) {
          newDiscrepancy = 'inactive'
        }
        let newOriginalDiscrepancy = false
        if (mortgageDiscrepancy === 'active') {
          newOriginalDiscrepancy = true
        }
        let newPublicRecordValue = publicRecordValue
        //* If there were previous entries in the public records but now it is empty, we want to retain the old PR value
        if (!publicRecordValue && mortgagePRValue && mortgagePRValue.length > 0) {
          newPublicRecordValue = mortgagePRValue
        }
        //* If the public records are empty due to the failure to receive data from a previously available vender, we do not want to lose the old public record value
        if ((!publicRecordValue || (typeof publicRecordValue === 'string' && publicRecordValue.length === 0)) && skipMissingVendorRejections && mortgageRecordStatus === 'inactive' || mortgageRecordStatus === 'initial') {
          newPublicRecordValue = mortgageCurrentValue
        }
        //* If the current records are empty due to never receiving this data before, save to match public records
        let newCurrentValue = mortgageCurrentValue
        let newRecordOriginal = mortgageRecordOriginal
        if (skipNewVendorRejections) {
          newCurrentValue = newPublicRecordValue
          newRecordOriginal = newPublicRecordValue
        }
        //* If
        newRecordDetails[baseAPIMapping][highestAPIMapping] = {
          prBackup: prBackup,
          prDiscrepancy: prDiscrepancy,
          prDiscrepancy: prDiscrepancy,
          assignedTier: newTier,
          discrepancy: newDiscrepancy,
          status: newStatus,
          label: mortgageRecordLabel,
          originalValue: newRecordOriginal,
          publicRecordValue: newPublicRecordValue,
          currentValue: newCurrentValue,
          originalDiscrepancy: newOriginalDiscrepancy,
        }
      }
    }
  }

  if (!discrepancyDetected) {
    totalInactiveLeads = true
  }
  if (querySettings.createLead !== 'false') {
    if (leadTierAssignment === 2) {
      if (previousLeadTierAssignment !== 2) {
        if (!mortgageHasActiveLead) {
          totalNewTier2Leads = true
        }
        newTier2Count = true
      } else {
        if (leadUpdated) {
          totalUpdated = true
          updatedTier2Count = true
        }
      }
    } else if (leadTierAssignment === 1) {
      if (previousLeadTierAssignment === 2) {
        leadsWithUpgradedTiers = true
        upgradedTier2Count = true
        newTier2Count = true
      }
      if (previousLeadTierAssignment !== 1) {
        if (!mortgageHasActiveLead) {
          totalNewTier1Leads = true
        }
        newTier1Count = true
      } else {
        if (leadUpdated) {
          totalUpdated = true
          updatedTier1Count = true
        }
      }
    }
  }

  // if (mortgageTagUpdatedBooleans.ownerEntityType === true && ownerIsTrust) {
  //   mortgageTagUpdatedBooleans.ownerEntityType = false
  //   mortgageTagUpdatedBooleans.ownerIsTrust = true
  //   existingMortgageTagFieldArrays.ownerIsTrust = [ownerTrustName]
  //   existingMortgageTagFieldArrays.ownerEntityType = []
  // } else if (mortgageTagUpdatedBooleans.ownerEntityType && ownerIsRevocableTrust) {
  //   mortgageTagUpdatedBooleans.ownerEntityType = false
  //   mortgageTagUpdatedBooleans.ownerIsRevocableTrust = true
  //   existingMortgageTagFieldArrays.ownerIsRevocableTrust = [ownerIsRevocableTrustName]
  //   existingMortgageTagFieldArrays.ownerEntityType = []
  // }

  let updatedLeadTagFieldArrays = existingLeadTagFieldArrays
  let updatedMortgageTagFieldArrays = existingMortgageTagFieldArrays

  return { createNew, totalNewTier1Leads, totalNewTier2Leads, mortgageTier1Discrepancies, mortgageTier2Discrepancies, mortgageTier3Discrepancies, leadsWithUpgradedTiers, upgradedTier2Count, newTier2Count, totalUpdated, updatedTier1Count, newTier1Count, updatedTier2Count, totalInactiveLeads, mortgageDiscrepancies, newTier1Discrepancies, newTier2Discrepancies, newTier3Discrepancies, newOwner1FullName, newOwner2FullName, newOwner1, newOwner2, newOwnerDetails, newRecordDetails, leadTierAssignment, leadActiveDiscrepancyCount, previousLeadTierAssignment, publicRecordsUpdated, recordUpdatesDontMatchEntirely, existingLeadTags, updatedLeadTagFieldArrays, leadTagUpdatedBooleans, updatedMortgageTagFieldArrays, mortgageTagUpdatedBooleans, newRejectedDiscrepancies, newResolvedDiscrepancies, leadUpdated, updatedTier1Discrepancies, updatedTier2Discrepancies, updatedTier3Discrepancies, resolvedTier1Discrepancies, resolvedTier2Discrepancies, resolvedTier3Discrepancies, newOriginalDiscrepancies, newAssessmentInformation, newAssessmentInformationBool, newTaxInformation, newTaxInformationBool, assessmentValueDifference};
}