
exports.updateMortgageTagFields = async function (highestAPIMapping, teamMortgageTags, existingMortgageTagFieldArrays, publicRecordValue, ownerAccountedFor, revocableOwnerAccountedFor, llcOwnerAccountedFor, loanTypeAccountedFor, propertyTypeAccountedFor) {
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
  if (publicRecordValue) {
    let tagType = ''
    if (highestAPIMapping === 'Owner1IsCorporation' || highestAPIMapping === 'Owner2IsCorporation' || highestAPIMapping === 'CorporateIndicator' || highestAPIMapping === 'Owner1FullName' || highestAPIMapping === 'Owner1LastName' || highestAPIMapping === 'Owner1FirstName' || highestAPIMapping === 'Owner2FullName' || highestAPIMapping === 'Owner2LastName' || highestAPIMapping === 'Owner2FirstName') {
      if (publicRecordValue.trim().toUpperCase() !== 'N') {
        //* Living Trust
        let includesFlt = publicRecordValue.toUpperCase().includes(' FLT ')
        let includesFltEnd = publicRecordValue.toUpperCase().includes(' FLT')
        let includesLiving = publicRecordValue.toUpperCase().includes('LIVING')
        let includesLt = publicRecordValue.toUpperCase().includes(' LT ')
        //* LLP
        let includesLlpDots = publicRecordValue.toUpperCase().includes('L.L.P.')
        let includesLlp = publicRecordValue.toUpperCase().includes(' LLP ')
        let includesLlpEnd = publicRecordValue.toUpperCase().includes(' LLP')
        let includesLimitedLiabilityPartnership = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY PARTNERSHIP')
        //* Association
        let includesAssn = publicRecordValue.toUpperCase().includes(' ASSN ')
        let includesAssnEnd = publicRecordValue.toUpperCase().includes(' ASSN')
        let includesAssociation = publicRecordValue.toUpperCase().includes('ASSOCIATION')
        //* LLC
        let includesLlcDots = publicRecordValue.toUpperCase().includes('L.L.C.')
        let includesLlc = publicRecordValue.toUpperCase().includes(' LLC ')
        let includesLlcEnd = publicRecordValue.toUpperCase().includes(' LLC')
        let includesLtd = publicRecordValue.toUpperCase().includes(' LTD ')
        let includesLtdEnd = publicRecordValue.toUpperCase().includes(' LTD')
        let includesLimited = publicRecordValue.toUpperCase().includes('LIMITED')
        let includesLiability = publicRecordValue.toUpperCase().includes('LIABILITY')
        let includesLimitedLiabilityCorporation = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY CORPORATION')
        let includesLimitedLiabilityCompany = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY COMPANY')
        let includesLimitedLiabilityCo = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY CO')
        //* INC
        let includesInc = publicRecordValue.toUpperCase().includes(' INC ')
        let includesIncEnd = publicRecordValue.toUpperCase().includes(' INC')
        let includesIncorporated = publicRecordValue.toUpperCase().includes('INCORPORATED')
        //* Family Limited Liability Partnership
        let includesPartnership = publicRecordValue.toUpperCase().includes('PARTNERSHIP')
        let includesFllpDots = publicRecordValue.toUpperCase().includes('F.L.L.P.')
        let includesFllp = publicRecordValue.toUpperCase().includes(' FLLP ')
        let includesFllpEnd = publicRecordValue.toUpperCase().includes(' FLLP')
        let includesFlpDots = publicRecordValue.toUpperCase().includes('F.L.P.')
        let includesFlp = publicRecordValue.toUpperCase().includes(' FLP ')
        let includesFlpEnd = publicRecordValue.toUpperCase().includes(' FLP')
        let includesFamily = publicRecordValue.toUpperCase().includes('FAMILY')
        let includesFmly = publicRecordValue.toUpperCase().includes('FMLY')
        //* Recable Trust
        let includesRevoc = publicRecordValue.toUpperCase().includes('REVOC')
        //* Trust
        let includesTrust = publicRecordValue.toUpperCase().includes('TRUST')
        let includesTr = publicRecordValue.toUpperCase().includes(' TR ')
        let includesTrEnd = publicRecordValue.toUpperCase().endsWith(' TR')
        if (((includesTrust || includesTr || includesTrEnd) && (includesLiving)) || includesLt || includesFlt || includesFltEnd) {
          tagType = 'ownerIsLivingTrust'
          ownerAccountedFor = true
        } else if (includesLlpDots || includesLlp || includesLlpEnd || includesLimitedLiabilityPartnership) {
          tagType = 'ownerIsLLP'
          ownerAccountedFor = true
        } else if (includesAssn || includesAssnEnd || includesAssociation) {
          tagType = 'ownerIsAssociation'
          ownerAccountedFor = true
        } else if (includesLlc || includesLlcEnd || includesLimitedLiabilityCorporation || includesLimitedLiabilityCompany) {
          tagType = 'ownerIsLLC'
          llcOwnerAccountedFor = true
          ownerAccountedFor = true
        } else if (includesFllp || includesFllpEnd || includesFlp || includesFlpEnd || ((includesFamily || includesFmly) && includesPartnership)) {
          tagType = 'ownerIsFLLP'
          ownerAccountedFor = true
        } else if (includesLlcDots || includesInc || includesIncEnd || includesIncorporated || includesLimitedLiabilityCo || includesFlpDots || includesFllpDots || ((includesLtd || includesLtdEnd || includesLimited) && (includesLiability))) {
          tagType = 'ownerIsCorporation'
          ownerAccountedFor = true
        } else if (includesRevoc ) {
          tagType = 'ownerIsRevocableTrust'
          ownerAccountedFor = true
          revocableOwnerAccountedFor = true
        } else if (includesTrust || includesTr || includesTrEnd) {
          tagType = 'ownerIsTrust'
          ownerAccountedFor = true
        } else if (publicRecordValue.trim().toUpperCase() === 'Y') {
          tagType = 'miscEntityOwnerType'
        }
      }
    } else if (highestAPIMapping === 'PropertySubTypeDescription' || highestAPIMapping === 'PropertyType') {
      if (publicRecordValue.trim().toUpperCase() === 'RESIDENTIAL') {
        tagType = 'residentialProperty'
        propertyTypeAccountedFor = true
      } else if (publicRecordValue.trim().toUpperCase() === 'COMMERCIAL') {
        tagType = 'commercialProperty'
        propertyTypeAccountedFor = true
      } else {
        tagType = 'miscPropertyType'
      }
    } else if (highestAPIMapping === 'PrimaryLoanType') {
      if (publicRecordValue.trim().toUpperCase() === 'CONVENTIONAL') {
        tagType = 'conventionalLoan'
        loanTypeAccountedFor = true
      } else {
        tagType = 'miscLoanType'
      }
    }
    if (tagType.length > 0) {
      let pushField = true
      for (let j = 0; j < existingMortgageTagFieldArrays[tagType].length; j++) {
        if (existingMortgageTagFieldArrays[tagType][j] === publicRecordValue.trim().toUpperCase()) {
          pushField = false
        }
      }
      if (pushField) {                    
        mortgageTagUpdatedBooleans[tagType] = true
        existingMortgageTagFieldArrays[tagType].push(publicRecordValue.trim().toUpperCase())
      }
    } else {
      for (let i = 0; i < teamMortgageTags.length; i++) {
        let matchingTeamTag = teamMortgageTags[i].discrepancyFields.find((field) => field === highestAPIMapping)
        if (matchingTeamTag) {
          if (teamMortgageTags[i].apiMapping === 'quitClaim') {
            if (publicRecordValue && publicRecordValue.trim().toUpperCase() !== 'FALSE') {
              let pushField = true
              for (let j = 0; j < existingMortgageTagFieldArrays.quitClaim.length; j++) {
                if (existingMortgageTagFieldArrays.quitClaim[j] === highestAPIMapping) {
                  pushField = false
                }
              }
              if (pushField) {     
                mortgageTagUpdatedBooleans.quitClaim = true
                existingMortgageTagFieldArrays.quitClaim.push(highestAPIMapping)
              }               
            }
          } else if (teamMortgageTags[i].apiMapping === 'taxInitialDelinquencyYear') {
            if (publicRecordValue && publicRecordValue.trim().toUpperCase() !== 'FALSE' && publicRecordValue.trim().toUpperCase() !== 'N') {
              let pushField = true
              for (let j = 0; j < existingMortgageTagFieldArrays.taxInitialDelinquencyYear.length; j++) {
                if (existingMortgageTagFieldArrays.taxInitialDelinquencyYear[j] === highestAPIMapping) {
                  pushField = false
                }
              }
              if (pushField) {                    
                mortgageTagUpdatedBooleans.taxInitialDelinquencyYear = true
                existingMortgageTagFieldArrays.taxInitialDelinquencyYear.push(publicRecordValue)
              }
            }
          } else if (teamMortgageTags[i].apiMapping === 'reoFlag') {
            if (publicRecordValue && publicRecordValue.trim().toUpperCase() !== 'FALSE' && publicRecordValue.trim().toUpperCase() !== 'N') {
              let pushField = true
              for (let j = 0; j < existingMortgageTagFieldArrays.reoFlag.length; j++) {
                if (existingMortgageTagFieldArrays.reoFlag[j] === highestAPIMapping) {
                  pushField = false
                }
              }
              if (pushField) {                    
                mortgageTagUpdatedBooleans.reoFlag = true
                existingMortgageTagFieldArrays.reoFlag.push(highestAPIMapping)
              }
            }
          } else if (teamMortgageTags[i].apiMapping === 'distress') {
            if (publicRecordValue && publicRecordValue.trim().toUpperCase() !== 'FALSE' && publicRecordValue.trim().toUpperCase() !== 'N') {
              let pushField = true
              for (let j = 0; j < existingMortgageTagFieldArrays.distress.length; j++) {
                if (existingMortgageTagFieldArrays.distress[j] === highestAPIMapping) {
                  pushField = false
                }
              }
              if (pushField) {                    
                mortgageTagUpdatedBooleans.distress = true
                existingMortgageTagFieldArrays.distress.push(publicRecordValue)
              }
            }
          } else if (teamMortgageTags[i].apiMapping === 'secondMortgage') {
            let pushField = true
            for (let j = 0; j < existingMortgageTagFieldArrays.secondMortgage.length; j++) {
              if (existingMortgageTagFieldArrays.secondMortgage[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              mortgageTagUpdatedBooleans.secondMortgage = true
              existingMortgageTagFieldArrays.secondMortgage.push(highestAPIMapping)
            }
          } else if (teamMortgageTags[i].apiMapping === 'ownerOccupied') {
            if (publicRecordValue && publicRecordValue.trim().toUpperCase() === 'Y') {
              let pushField = true
              for (let j = 0; j < existingMortgageTagFieldArrays.ownerOccupied.length; j++) {
                if (existingMortgageTagFieldArrays.ownerOccupied[j] === highestAPIMapping) {
                  pushField = false
                }
              }
              if (pushField) {                    
                mortgageTagUpdatedBooleans.ownerOccupied = true
                existingMortgageTagFieldArrays.ownerOccupied.push(publicRecordValue)
              }
            }
          } else if (teamMortgageTags[i].apiMapping === 'taxExemptionStatus') {
            let pushField = true
            for (let j = 0; j < existingMortgageTagFieldArrays.taxExemptionStatus.length; j++) {
              if (existingMortgageTagFieldArrays.taxExemptionStatus[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              mortgageTagUpdatedBooleans.taxExemptionStatus = true
              existingMortgageTagFieldArrays.taxExemptionStatus.push(highestAPIMapping)
            }
          }
        }
      }
    }
  }

  return {existingMortgageTagFieldArrays, mortgageTagUpdatedBooleans, ownerAccountedFor, revocableOwnerAccountedFor, llcOwnerAccountedFor, loanTypeAccountedFor, propertyTypeAccountedFor}
}

exports.updateLeadTagFields = async function (highestAPIMapping, teamLeadTags, existingLeadTagFieldArrays, publicRecordValue) {
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
  if (publicRecordValue) {
    let tagType = ''
    if (highestAPIMapping === 'Owner1IsCorporation' || highestAPIMapping === 'Owner2IsCorporation' || highestAPIMapping === 'CorporateIndicator' || highestAPIMapping === 'Owner1FullName' || highestAPIMapping === 'Owner1LastName' || highestAPIMapping === 'Owner1FirstName' || highestAPIMapping === 'Owner2FullName' || highestAPIMapping === 'Owner2LastName' || highestAPIMapping === 'Owner2FirstName') {
      if (publicRecordValue.trim().toUpperCase() !== 'N') {
        let pushField = true
        for (let j = 0; j < existingLeadTagFieldArrays.transfer.length; j++) {
          if (existingLeadTagFieldArrays.transfer[j] === highestAPIMapping) {
            pushField = false
          }
        }
        if (pushField) {                    
          leadTagUpdatedBooleans.transfer = true
          existingLeadTagFieldArrays.transfer.push(highestAPIMapping)
        }
        //* Living Trust
        let includesFlt = publicRecordValue.toUpperCase().includes(' FLT ')
        let includesFltEnd = publicRecordValue.toUpperCase().includes(' FLT')
        let includesLiving = publicRecordValue.toUpperCase().includes('LIVING')
        let includesLt = publicRecordValue.toUpperCase().includes(' LT ')
        //* LLP
        let includesLlpDots = publicRecordValue.toUpperCase().includes('L.L.P.')
        let includesLlp = publicRecordValue.toUpperCase().includes(' LLP ')
        let includesLlpEnd = publicRecordValue.toUpperCase().includes(' LLP')
        let includesLimitedLiabilityPartnership = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY PARTNERSHIP')
        //* Association
        let includesAssn = publicRecordValue.toUpperCase().includes(' ASSN ')
        let includesAssnEnd = publicRecordValue.toUpperCase().includes(' ASSN')
        let includesAssociation = publicRecordValue.toUpperCase().includes('ASSOCIATION')
        //* LLC
        let includesLlcDots = publicRecordValue.toUpperCase().includes('L.L.C.')
        let includesLlc = publicRecordValue.toUpperCase().includes(' LLC ')
        let includesLlcEnd = publicRecordValue.toUpperCase().includes(' LLC')
        let includesLtd = publicRecordValue.toUpperCase().includes(' LTD ')
        let includesLtdEnd = publicRecordValue.toUpperCase().includes(' LTD')
        let includesLimited = publicRecordValue.toUpperCase().includes('LIMITED')
        let includesLiability = publicRecordValue.toUpperCase().includes('LIABILITY')
        let includesLimitedLiabilityCorporation = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY CORPORATION')
        let includesLimitedLiabilityCompany = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY COMPANY')
        let includesLimitedLiabilityCo = publicRecordValue.toUpperCase().includes('LIMITED LIABILITY CO')
        //* INC
        let includesInc = publicRecordValue.toUpperCase().includes(' INC ')
        let includesIncEnd = publicRecordValue.toUpperCase().includes(' INC')
        let includesIncorporated = publicRecordValue.toUpperCase().includes('INCORPORATED')
        //* Family Limited Liability Partnership
        let includesPartnership = publicRecordValue.toUpperCase().includes('PARTNERSHIP')
        let includesFllpDots = publicRecordValue.toUpperCase().includes('F.L.L.P.')
        let includesFllp = publicRecordValue.toUpperCase().includes(' FLLP ')
        let includesFllpEnd = publicRecordValue.toUpperCase().includes(' FLLP')
        let includesFlpDots = publicRecordValue.toUpperCase().includes('F.L.P.')
        let includesFlp = publicRecordValue.toUpperCase().includes(' FLP ')
        let includesFlpEnd = publicRecordValue.toUpperCase().includes(' FLP')
        let includesFamily = publicRecordValue.toUpperCase().includes('FAMILY')
        let includesFmly = publicRecordValue.toUpperCase().includes('FMLY')
        //* Recable Trust
        let includesRevoc = publicRecordValue.toUpperCase().includes('REVOC')
        //* Trust
        let includesTrust = publicRecordValue.toUpperCase().includes('TRUST')
        let includesTr = publicRecordValue.toUpperCase().includes(' TR ')
        let includesTrEnd = publicRecordValue.toUpperCase().endsWith(' TR')
        if (((includesTrust || includesTr || includesTrEnd) && (includesLiving)) || includesLt || includesFlt || includesFltEnd) {
          tagType = 'newOwnerIsLivingTrust'
          ownerAccountedFor = true
        } else if (includesLlpDots || includesLlp || includesLlpEnd || includesLimitedLiabilityPartnership) {
          tagType = 'newOwnerIsLLP'
          ownerAccountedFor = true
        } else if (includesAssn || includesAssnEnd || includesAssociation) {
          tagType = 'newOwnerIsAssociation'
          ownerAccountedFor = true
        } else if (includesLlc || includesLlcEnd || includesLimitedLiabilityCorporation || includesLimitedLiabilityCompany) {
          tagType = 'newOwnerIsLLC'
          llcOwnerAccountedFor = true
          ownerAccountedFor = true
        } else if (includesFllp || includesFllpEnd || includesFlp || includesFlpEnd || ((includesFamily || includesFmly) && includesPartnership)) {
          tagType = 'newOwnerIsFLLP'
          ownerAccountedFor = true
        } else if (includesLlcDots || includesInc || includesIncEnd || includesIncorporated || includesLimitedLiabilityCo || includesFlpDots || includesFllpDots || ((includesLtd || includesLtdEnd || includesLimited) && (includesLiability))) {
          tagType = 'newOwnerIsCorporation'
          ownerAccountedFor = true
        } else if (includesRevoc ) {
          tagType = 'newOwnerIsRevocableTrust'
          ownerAccountedFor = true
          revocableOwnerAccountedFor = true
        } else if (includesTrust || includesTr || includesTrEnd) {
          tagType = 'newOwnerIsTrust'
          ownerAccountedFor = true
        } else if (publicRecordValue.trim().toUpperCase() === 'Y') {
          tagType = 'miscEntityNewOwnerType'
        }
      }
    }
    if (tagType.length > 0) {
      let pushField = true
      for (let j = 0; j < existingLeadTagFieldArrays[tagType].length; j++) {
        if (existingLeadTagFieldArrays[tagType][j] === publicRecordValue.trim().toUpperCase()) {
          pushField = false
        }
      }
      if (pushField) {                    
        leadTagUpdatedBooleans[tagType] = true
        existingLeadTagFieldArrays[tagType].push(publicRecordValue.trim().toUpperCase())
      }
    } else {
      for (let i = 0; i < teamLeadTags.length; i++) {
        let matchingTeamTag = teamLeadTags[i].discrepancyFields.find((field) => field === highestAPIMapping)
        if (matchingTeamTag) {
          if (teamLeadTags[i].apiMapping === 'assessment') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.assessment.length; j++) {
              if (existingLeadTagFieldArrays.assessment[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.assessment = true
              existingLeadTagFieldArrays.assessment.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'transfer') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.transfer.length; j++) {
              if (existingLeadTagFieldArrays.transfer[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.transfer = true
              existingLeadTagFieldArrays.transfer.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'distress') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.distress.length; j++) {
              if (existingLeadTagFieldArrays.distress[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.distress = true
              existingLeadTagFieldArrays.distress.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'subdivision') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.subdivision.length; j++) {
              if (existingLeadTagFieldArrays.subdivision[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.subdivision = true
              existingLeadTagFieldArrays.subdivision.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'rezoning') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.rezoning.length; j++) {
              if (existingLeadTagFieldArrays.rezoning[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.rezoning = true
              existingLeadTagFieldArrays.rezoning.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'improvements') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.improvements.length; j++) {
              if (existingLeadTagFieldArrays.improvements[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.improvements = true
              existingLeadTagFieldArrays.improvements.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'addSubUnits') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.addSubUnits.length; j++) {
              if (existingLeadTagFieldArrays.addSubUnits[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.addSubUnits = true
              existingLeadTagFieldArrays.addSubUnits.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'taxExemptionStatus') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.taxExemptions.length; j++) {
              if (existingLeadTagFieldArrays.taxExemptions[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.taxExemptions = true
              existingLeadTagFieldArrays.taxExemptions.push(highestAPIMapping)
            }
          } else if (teamLeadTags[i].apiMapping === 'newMortgage') {
            let pushField = true
            for (let j = 0; j < existingLeadTagFieldArrays.newMortgage.length; j++) {
              if (existingLeadTagFieldArrays.newMortgage[j] === highestAPIMapping) {
                pushField = false
              }
            }
            if (pushField) {                    
              leadTagUpdatedBooleans.newMortgage = true
              existingLeadTagFieldArrays.newMortgage.push(highestAPIMapping)
            }
          }
        }
      }
    }
  }

  return {existingLeadTagFieldArrays, leadTagUpdatedBooleans}
}