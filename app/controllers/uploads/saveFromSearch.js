const moment = require('moment')
const mongoose = require('mongoose')
const TeamModel = require('../../models/team')
const LeadTagModel = require('../../models/leadTag')
const MortgageModel = require('../../models/mortgage')
const ActiveLeadModel = require('../../models/activeLead')
const MortgageTagModel = require('../../models/mortgageTag')
const { updateTimeframe } = require('../../utils/mortgages/updateTimeframe.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils')
const { recordDetailsObj } = require('../../utils/teamEnvironmentModels.utils')
const { provideFinancials } = require('../../utils/mortgages/provideFinancials.utils')
const { monthlyStatsDates } = require('../../utils/dates.utils')
const { establishMonthlyStatSession } = require('../../utils/monthlyStats.utils')
const { mortgageTagAPIMappings, leadTagAPIMappings } = require('../../utils/tags/mapping.utils')
const { updateMortgageTagFields, updateLeadTagFields } = require('../../utils/tags/updateFields.utils')
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils')

async function saveFromSearch(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Saving a Property from Search")

    let newRecordDetails = recordDetailsObj
    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")

    let dates = monthlyStatsDates(moment(new Date()))
    let thisMonthNo = moment(todaysDate).month()
    let sessionLabelFull = moment(new Date()).format('MMM YYYY')
    let sessionToParse = moment(todaysDate).toISOString()
    let sessionStrToParse = moment(sessionToParse.substring(0,7))
    let portfolioStatSessionParsed = Date.parse(sessionStrToParse)
    let monthlyStatSession = await establishMonthlyStatSession(thisMonthNo, todaysDate)
    let quarter = monthlyStatSession.quarter
    let sessionStr = monthlyStatSession.sessionStr
    let sessionLabel = monthlyStatSession.sessionLabel
    let quarterSession = monthlyStatSession.quarterSession
    let sessionParsed = Date.parse(sessionStrToParse)
    let saveFromSearch = req.body.saveFromSearch
    let newFinancials = null

    let team = await TeamModel.findById(req.body.teamId).populate('mortgages', 'monthsRemaining').populate('defaultPaymentSchedule').populate('sweepParameters').populate('mortgageTags').populate('leadTags').select('_id defaultTargetTerm mortgages sweepParameters defaultTargetInterestRate mortgageTags defaultPaymentSchedule leadTags totalOriginalLoanAmount totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining')
    let existingMortgages = team.mortgages
    let teamMortgageTags = team.mortgageTags
    let teamLeadTags = team.leadTags
    let defaultTargetTerm = team.defaultTargetTerm
    let numberOfMortgages = team.mortgages.length
    let defaultTargetInterestRate = team.defaultTargetInterestRate
    let originalInterestDifference = req.body.originalInterestDifference
    let interestRemainingDifference = req.body.interestRemainingDifference
    let originalLoanAmountDifference = req.body.originalLoanAmountDifference
    let principalRemainingDifference = req.body.principalRemainingDifference
    let assessmentValueDifference = req.body.assessmentValueDifference

    let newMortgageId = new mongoose.mongo.ObjectId()
    let newLeadId = new mongoose.mongo.ObjectId()
    let ownerIsRevocableTrust = false
    let leadTags = []
    let leadTagIds = []
    let mortgageTags = []
    let mortgageTagIds = []
    let returnLeadTags = []
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
    let mortgageTagFieldArrays = {
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
    let leadTagFieldArrays = {
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

    let mortgageTerm = req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageTerm.publicRecordValue
    let originationDate = req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue
    let originalLoanAmount = req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageAmount.publicRecordValue
    let originalInterestRate = req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageInterestRate.publicRecordValue
    let mortgageTermProvided = null
    let originationDateProvided = null
    let originalLoanAmountProvided = null
    let originalInterestRateProvided = null
    if (req.body.financialsChecked) {
      originationDateProvided = moment(req.body.OriginationDate, 'MM/DD/YYYY').toISOString()
      if (req.body.LoanAmount.length > 0) {
        originalLoanAmountProvided = parseFloat(req.body.LoanAmount)
      }
      if (req.body.InterestRate.length > 0) {
        originalInterestRateProvided = parseFloat(req.body.InterestRate)
      }
      if (req.body.MortgageTerm.length > 0) {
        mortgageTermProvided = parseFloat(req.body.MortgageTerm)
      }
    }
    let owner1 = req.body.recordDetailsObj.owner1.Owner1FullName.publicRecordValue
    let owner2 = req.body.recordDetailsObj.owner2.Owner2FullName.publicRecordValue
    let owner1Provided = null
    let owner2Provided = null
    if (req.body.ownersChecked) {
      if (req.body.Owner1FullName) {
        owner1Provided = req.body.Owner1FullName.toUpperCase()
      }
      if (req.body.Owner2FullName) {
        owner2Provided = req.body.Owner2FullName.toUpperCase()
      }
    }
    // let newLeadTags = []
    // let newLeadTagsIds = []
    let activeLeadTier = null
    let createActiveLead = false
    let ownerAccountedFor = false
    let leadOwnerAccountedFor = false
    let newTransferLeadTag = null
    // let newMortgageLeadTag = null
    let teamMortgageLeadTag = null
    let teamTransferLeadTag = null
    let llcOwnerAccountedFor = false
    let llcLeadOwnerAccountedFor = false
    let loanTypeAccountedFor = false
    let newTier1Discrepancies = []
    // let leadTagTimelineEntries = []
    let activeDiscrepanciesCount = 0
    let propertyTypeAccountedFor = false
    let revocableOwnerAccountedFor = false
    let revocableLeadOwnerAccountedFor = false
    for (let j = 0; j < Object.entries(req.body.recordDetailsObj).length; j++) {
      for (let k = 0; k < Object.entries(Object.entries(req.body.recordDetailsObj)[j][1]).length; k++) {
        let baseAPIMapping = (Object.entries(req.body.recordDetailsObj)[j][0])
        let highestAPIMapping = Object.entries(Object.entries(req.body.recordDetailsObj)[j][1])[k][0]
        let prBackup= (Object.entries(Object.entries(req.body.recordDetailsObj)[j][1]))[k][1].backup
        let recordLabel = Object.entries(Object.entries(req.body.recordDetailsObj)[j][1])[k][1].label
        let recordValue = Object.entries(Object.entries(req.body.recordDetailsObj)[j][1])[k][1].publicRecordValue
        let currentValue = Object.entries(Object.entries(req.body.recordDetailsObj)[j][1])[k][1].publicRecordValue
        let originalValue = Object.entries(Object.entries(req.body.recordDetailsObj)[j][1])[k][1].publicRecordValue
        let originalDiscrepancy = false
        let prDiscrepancy = false
        let discrepancy = 'inactive'
        let status = 'inactive'

        if (highestAPIMapping === 'AssessedValue' && parseFloat(recordValue)) {
          assessmentValueDifference = parseFloat(recordValue)
        }

        if (highestAPIMapping === 'Owner1FullName' || highestAPIMapping === 'Owner2FullName') {
          // //* Trust check
          // let includesRevocableTrust = recordValue.toUpperCase().includes('REVOCABLE')
          // let includesRevocTrust = recordValue.toUpperCase().includes('REVOC')
          // if (includesRevocableTrust || includesRevocTrust) {
          //   ownerIsTrust = false
          //   ownerIsRevocableTrust = true
          // } else if (!ownerIsRevocableTrust) {
          //   let includesTrust = recordValue.toUpperCase().includes('TRUST')
          //   let includesTr = recordValue.toUpperCase().includes(' TR ')
          //   let includesTrEnd = recordValue.toUpperCase().endsWith(' TR')
          //   if (includesTrust || includesTr || includesTrEnd) {
          //     ownerIsTrust = true
          //     ownerTrustName = recordValue
          //   }
          // }
          //* Discrepancy Check
          if (req.body.ownersChecked) {
            let discrepancyField = ''
            if (highestAPIMapping === 'Owner1FullName') {
              currentValue = owner1Provided
              originalValue = owner1Provided
              discrepancyField = 'Owner1FullName'
            } else if (highestAPIMapping === 'Owner2FullName') {
              currentValue = owner2Provided
              originalValue = owner2Provided
              discrepancyField = 'Owner2FullName'
            }
            if (currentValue !== recordValue) {
              if (recordValue && recordValue.length > 0) {
                status = 'discrepancy'
                discrepancy = 'active'
                createActiveLead = true
                originalDiscrepancy = true
                activeLeadTier = 1
                activeDiscrepanciesCount = activeDiscrepanciesCount + 1
                newTier1Discrepancies.push({
                  label: recordLabel,
                  originalValue: originalValue,
                  publicRecordValue: recordValue,
                })
                let leadTagUpdates = await updateLeadTagFields(highestAPIMapping, teamLeadTags, leadTagFieldArrays, recordValue)
                leadOwnerAccountedFor = leadTagUpdates.ownerAccountedFor
                llcLeadOwnerAccountedFor = leadTagUpdates.llcLeadOwnerAccountedFor
                revocableLeadOwnerAccountedFor = leadTagUpdates.revocableOwnerAccountedFor
                leadTagFieldArrays = leadTagUpdates.existingLeadTagFieldArrays
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
                if (leadTagUpdates.leadTagUpdatedBooleans.newOwnerIsLLC) {
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
                // if (newTransferLeadTag) {
                //   newTransferLeadTag.discrepancyFields.push(discrepancyField)
                // } else {
                //   teamTransferLeadTag = await LeadTagModel.findOneAndUpdate({apiMapping: 'transfer'}, {$inc: {currentAssignments: 1, activeLeads: 1}})
                //   // newLeadTagsIds.push(teamTransferLeadTag._id)
                //   newTransferLeadTag = {
                //     tagId: teamTransferLeadTag._id,
                //     apiMapping: teamTransferLeadTag.apiMapping,
                //     label: teamTransferLeadTag.label,
                //     discrepancyFields: [discrepancyField],
                //     status: teamTransferLeadTag.status,
                //   }
                // }
              } else if (currentValue !== null && !isNaN(currentValue)) {
                status = 'discrepancy'
                discrepancy = 'provided'
              }
            }
          }
        } else if (req.body.financialsChecked) {
          let discrepancyField = ''
          if (highestAPIMapping === 'PrimaryMortgageAmount') {
            currentValue = parseFloat(originalLoanAmountProvided)
            originalValue = parseFloat(originalLoanAmountProvided)
            discrepancyField = 'PrimaryMortgageAmount'
          } else if (highestAPIMapping === 'PrimaryMortgageInterestRate') {
            currentValue = parseFloat(originalInterestRateProvided)
            originalValue = parseFloat(originalInterestRateProvided)
            discrepancyField = 'PrimaryMortgageInterestRate'
          } else if (highestAPIMapping === 'PrimaryMortgageStartDate') {
            currentValue = originationDateProvided
            originalValue = originationDateProvided
            discrepancyField = 'PrimaryMortgageStartDate'
          } else if (highestAPIMapping === 'PrimaryMortgageTerm') {
            currentValue = parseFloat(mortgageTermProvided)
            originalValue = parseFloat(mortgageTermProvided)
            discrepancyField = 'PrimaryMortgageTerm'
          }
          if (currentValue !== recordValue) {
            if (recordValue && recordValue.length > 0) {
              status = 'discrepancy'
              discrepancy = 'active'
              createActiveLead = true
              originalDiscrepancy = true
              activeLeadTier = 1
              activeDiscrepanciesCount = activeDiscrepanciesCount + 1
              newTier1Discrepancies.push({
                label: recordLabel,
                originalValue: originalValue,
                publicRecordValue: recordValue,
              })
              let leadTagUpdates = await updateLeadTagFields(highestAPIMapping, teamLeadTags, leadTagFieldArrays, recordValue)
              leadTagFieldArrays = leadTagUpdates.existingLeadTagFieldArrays
              if (leadTagUpdates.leadTagUpdatedBooleans.newMortgage) {
                leadTagUpdatedBooleans.newMortgage = true
              }
              // if (newMortgageLeadTag) {
              //   newMortgageLeadTag.discrepancyFields.push(discrepancyField)
              // } else {
              //   teamMortgageLeadTag = await LeadTagModel.findOneAndUpdate({apiMapping: 'newMortgage'}, {$inc: {currentAssignments: 1, activeLeads: 1}})
              //   newLeadTagsIds.push(teamMortgageLeadTag._id)
              //   newMortgageLeadTag = {
              //     tagId: teamMortgageLeadTag._id,
              //     apiMapping: teamMortgageLeadTag.apiMapping,
              //     label: teamMortgageLeadTag.label,
              //     discrepancyFields: [discrepancyField],
              //     status: teamMortgageLeadTag.status,
              //   }
              // }
            } else if (currentValue !== null && !isNaN(currentValue)) {
              status = 'discrepancy'
              discrepancy = 'provided'
            }
          }
        }
  
        let parameterField = team.sweepParameters.find(parameter => parameter.apiMapping === highestAPIMapping)
        if (!parameterField) {
          sweepParameter = false
        } else {
          matchedTierParameter = parameterField
        }
        let assignedTier = 0
        if (matchedTierParameter.assignedTier === 'one') {
          assignedTier = 'one'
        } else if (matchedTierParameter.assignedTier === 'two') {
          assignedTier = 'two'
        } else if (matchedTierParameter.assignedTier === 'three') {
          assignedTier = 'three'
        } else {
          assignedTier = 'zero'
        }
        if (recordValue === null) {
          recordValue = ''
        }
        newRecordDetails[baseAPIMapping][highestAPIMapping] = {
          prBackup: prBackup,
          prDiscrepancy: prDiscrepancy,
          discrepancy: discrepancy,
          originalDiscrepancy: originalDiscrepancy,
          status: status,
          label: recordLabel,
          assignedTier: assignedTier,
          originalValue: originalValue,
          publicRecordValue: recordValue,
          currentValue: currentValue,
        }
        let mortgageTagUpdates = await updateMortgageTagFields(highestAPIMapping, teamMortgageTags, mortgageTagFieldArrays, recordValue, ownerAccountedFor, revocableOwnerAccountedFor, loanTypeAccountedFor, propertyTypeAccountedFor)
        ownerAccountedFor = mortgageTagUpdates.ownerAccountedFor
        loanTypeAccountedFor = mortgageTagUpdates.loanTypeAccountedFor
        llcOwnerAccountedFor = mortgageTagUpdates.llcOwnerAccountedFor
        propertyTypeAccountedFor = mortgageTagUpdates.propertyTypeAccountedFor
        revocableOwnerAccountedFor = mortgageTagUpdates.revocableOwnerAccountedFor
        mortgageTagFieldArrays = mortgageTagUpdates.existingMortgageTagFieldArrays
        if (ownerAccountedFor) {
          mortgageTagUpdatedBooleans.miscEntityOwnerType = false
          mortgageTagFieldArrays.miscEntityOwnerType = []
        }
        if (revocableOwnerAccountedFor) {
          mortgageTagUpdatedBooleans.ownerIsTrust = false
          mortgageTagFieldArrays.ownerIsTrust = []
        }
        // if (llcOwnerAccountedFor) {
        //   mortgageTagUpdatedBooleans.ownerIsAssociation = false
        //   mortgageTagFieldArrays.ownerIsAssociation = []
        // }
        if (loanTypeAccountedFor) {
          mortgageTagUpdatedBooleans.miscLoanType = false
          mortgageTagFieldArrays.miscLoanType = []
        }
        if (propertyTypeAccountedFor) {
          mortgageTagUpdatedBooleans.miscPropertyType = false
          mortgageTagFieldArrays.miscPropertyType = []
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
    }
  
    //* Lead Tags
    let leadTagTimelineEntries = []
    for (let i = 0; i < Object.entries(leadTagUpdatedBooleans).length; i++) {
      if (Object.entries(leadTagUpdatedBooleans)[i][1] === true) {
        let thisTag = teamLeadTags.find(tag => tag.apiMapping === leadTagAPIMappings[i])
        let updatedTag = await LeadTagModel.findByIdAndUpdate((thisTag._id), { $inc: { activeLeads: 1, currentAssignments: 1 } }, {new: true})
        returnLeadTags.push(updatedTag)
        leadTags.push({
          tagId: thisTag._id,
          apiMapping: leadTagAPIMappings[i],
          label: thisTag.label,
          description: thisTag.description,
          discrepancyFields: Object.entries(leadTagFieldArrays)[i][1],
          status: 'query',
          origin: thisTag.origin,
        })
        leadTagIds.push(thisTag._id)
        leadTagTimelineEntries.push({
          label: thisTag.label,
          discrepancyFields: Object.entries(leadTagFieldArrays)[i][1],
        })
      }
    }

    //* Mortgage Tags
    let mortgageTagTimelineEntries = []
    for (let i = 0; i < Object.entries(mortgageTagUpdatedBooleans).length; i++) {
      if (Object.entries(mortgageTagUpdatedBooleans)[i][1] === true) {
        let thisTag = teamMortgageTags.find(tag => tag.apiMapping === mortgageTagAPIMappings[i])
        await MortgageTagModel.findByIdAndUpdate((thisTag._id), { $inc: { currentMortgages: 1 } })
        mortgageTags.push({
          tagId: thisTag._id,
          apiMapping: mortgageTagAPIMappings[i],
          label: thisTag.label,
          description: thisTag.description,
          discrepancyFields: Object.entries(mortgageTagFieldArrays)[i][1],
          status: 'query',
          origin: thisTag.origin,
        })
        mortgageTagIds.push(thisTag._id)
        mortgageTagTimelineEntries.push({
          label: thisTag.label,
          discrepancyFields: Object.entries(mortgageTagFieldArrays)[i][1],
        })
      }
    }

    let defaultPaymentSchedule = await MortgageTagModel.findOneAndUpdate(({apiMapping: team.defaultPaymentSchedule.apiMapping}), { $inc: { currentMortgages: 1 } })
    mortgageTags.push({
      tagId: team.defaultPaymentSchedule,
      apiMapping: defaultPaymentSchedule.apiMapping,
      label: defaultPaymentSchedule.label,
      discrepancyFields: defaultPaymentSchedule.discrepancyFields,
      status: defaultPaymentSchedule.status,
      origin: defaultPaymentSchedule.origin,
    })
    if (owner1Provided) {
      owner1 = owner1Provided
    }
    if (owner2Provided) {
      owner2 = owner2Provided
    }
    if (mortgageTermProvided) {
      mortgageTerm = mortgageTermProvided
    }
    if (originationDateProvided) {
      originationDate = originationDateProvided
    }
    if (originalInterestRateProvided) {
      originalInterestRate = originalInterestRateProvided
    }
    if (originalLoanAmountProvided) {
      originalLoanAmount = originalLoanAmountProvided
    }
    let newMortgageObj = {
      _id: newMortgageId,
      uploadDate: logTime,
      status: 'inactive',
      parcelNumber: req.body.recordDetailsObj.lot.ParcelNumber.publicRecordValue,
      amortizationSchedule: {apiMapping: defaultPaymentSchedule.apiMapping, label: defaultPaymentSchedule.label},
      loanType: req.body.recordDetailsObj.primaryMortgage.PrimaryLoanType.publicRecordValue,
      propertyLiens: [],
      recordDetails: newRecordDetails,
      streetAddress: req.body.recordDetailsObj.address.StreetAddressLine1.publicRecordValue,
      city: req.body.recordDetailsObj.address.City.publicRecordValue,
      state: req.body.recordDetailsObj.address.StateOrProvince.publicRecordValue.trim(),
      postalCode: req.body.recordDetailsObj.address.PostalCode.publicRecordValue,
      owner1: owner1,
      owner2: owner2,
      mortgageTerm: mortgageTerm,
      originationDate: originationDate,
      originalInterestRate: originalInterestRate,
      owner2: owner2,
      mortgageNotes: [],
      reports: [],
      lastDiscrepanciesDicvoered: '',
      tagIds: mortgageTagIds,
      tags: mortgageTags,
      propMixPropertyID: req.body.recordDetailsObj.identifiers.PMXPropertyId.publicRecordValue,
      attomPropertyID: req.body.recordDetailsObj.identifiers.AttomId.publicRecordValue,
      coreLogicPropertyID: req.body.recordDetailsObj.identifiers.CoreLogicClip.publicRecordValue,
      propMixSuccessDate: req.body.propMixSuccessDate,
      attomSuccessDate: req.body.attomSuccessDate,
      coreLogicSuccessDate: req.body.coreLogicSuccessDate,
      propertyType: req.body.recordDetailsObj.summary.PropertyType.publicRecordValue,
      lastUpdateDate: todaysDateLabel,
      financialsPresent: false,
      recordSweeps: 1,
    }

    let newLeadObj = {}
    if (createActiveLead) {
      // if (newMortgageLeadTag) {
        // newLeadTags.push(newMortgageLeadTag)
        // leadTagTimelineEntries.push({
        //   label: 'New Mortgage',
        //   discrepancyFields: newMortgageLeadTag.discrepancyFields,
        // })
      // }
      // if (newTransferLeadTag) {
        // newLeadTags.push(newTransferLeadTag)
        // leadTagTimelineEntries.push({
        //   label: 'Recent Transfer',
        //   discrepancyFields: newTransferLeadTag.discrepancyFields,
        // })
      // }
      newLeadObj = {
        _id: newLeadId,
        tags: leadTags,
        tagIds: leadTagIds,
        dateCreated: logTime,
        belongsToTeam: req.body.teamId,
        belongsToMortgage: newMortgageId,
        status: 'awaitingAction',
        publicRecordsUpdated: false,
        awaitingUpdates: false,
        tier: activeLeadTier,
        dateDiscovered: todaysDateLabel,
        dateDiscoveredLabel: todaysDateLabel,
        targetLoanTerm: defaultTargetTerm,
        targetInterestRate: defaultTargetInterestRate,
        reports: [],
        timeline: [],
        targetOutcome: 'unassigned',
        originalDiscrepancies: activeDiscrepanciesCount,
      }
    }
    
    let newDiffMonths = null
    let timelineDetails = 'Mortgage financials not fonud.'
    if (req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageAmount.publicRecordValue && req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageInterestRate.publicRecordValue && req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue && req.body.recordDetailsObj.primaryMortgage.PrimaryLoanType.publicRecordValue && req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageTerm.publicRecordValue) {
      timelineDetails = 'All mortgage financials included.'
    } else if (req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageAmount.publicRecordValue || req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageInterestRate.publicRecordValue || req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue || req.body.recordDetailsObj.primaryMortgage.PrimaryLoanType.publicRecordValue || req.body.recordDetailsObj.primaryMortgage.PrimaryMortgageTerm.publicRecordValue) {
      timelineDetails = 'Mortgage financials incomplete.'
    }
    if (originationDate && mortgageTerm && originalLoanAmount && originalInterestRate) {
      newFinancials = await provideFinancials(originationDate, mortgageTerm, todaysDate, originalLoanAmount, originalInterestRate, mortgageTerm, defaultTargetInterestRate, assessmentValueDifference, fromSweep = false, teamId = null)
      newMortgageObj.financialsPresent = true
      newMortgageObj.timeframePresent = true
      newDiffMonths = newFinancials.diffMonths
      newMortgageObj.originationDateLabel = newFinancials.originationDateLabel
      newMortgageObj.remainingTerm = newFinancials.remainingTerm
      newMortgageObj.monthsRemaining = newFinancials.diffMonths
      newMortgageObj.endDate = newFinancials.endDate
      newMortgageObj.endDateLabel = newFinancials.endDateLabel
      newMortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
      newMortgageObj.originalInterestRate = newFinancials.originalInterestRate
      newMortgageObj.monthlyPayments = newFinancials.monthlyPayments
      newMortgageObj.originalTotalDue = newFinancials.originalTotalDue
      newMortgageObj.originalInterestDue = newFinancials.originalInterestDue
      newMortgageObj.principalPaid = newFinancials.principalPaid
      newMortgageObj.interestPaid = newFinancials.interestPaid
      newMortgageObj.principalRemaining = newFinancials.principalRemaining
      newMortgageObj.interestRemaining = newFinancials.interestRemaining
      newMortgageObj.payments = newFinancials.payments
      interestRemainingDifference = newFinancials.interestRemaining
      principalRemainingDifference = newFinancials.principalRemaining
      originalLoanAmountDifference = newFinancials.originalLoanAmount
      originalInterestDifference = newFinancials.originalInterestDue
      // teamTotalInterestRemaining = teamTotalInterestRemaining + newFinancials.interestRemaining
      // teamTotalPrincipalRemaining = teamTotalPrincipalRemaining + newFinancials.principalRemaining
      // teamTotalOriginalLoanAmount = teamTotalOriginalLoanAmount + newFinancials.originalLoanAmount
      // teamTotalOriginalInterest = teamTotalOriginalInterest + newFinancials.originalInterestDue
      newLeadObj.remainingMonths = newFinancials.diffMonths
      newLeadObj.targetLoanAmount = newFinancials.principalRemaining
      newLeadObj.targetInterestDue = newFinancials.targetInterestDue
      newLeadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
      newLeadObj.targetProfitNumber = newFinancials.targetProfitNumber
      newLeadObj.targetProfitPercent = newFinancials.targetProfitPercent
    } else if (originationDate && mortgageTerm) {
      newMortgageObj.mortgageTerm = mortgageTerm
      newMortgageObj.originationDate = originationDate
      let newTimeframe = await updateTimeframe(originationDate, mortgageTerm, todaysDate)
      newMortgageObj.timeframePresent = true
      newDiffMonths = newTimeframe.diffMonths
      newMortgageObj.originationDateLabel = newTimeframe.originationDateLabel
      newMortgageObj.remainingTerm = newTimeframe.remainingTerm
      newMortgageObj.monthsRemaining = newTimeframe.diffMonths
      newMortgageObj.endDate = newTimeframe.endDate
      newMortgageObj.endDateLabel = newTimeframe.endDateLabel
      newLeadObj.remainingMonths = newTimeframe.diffMonths
      if (originalLoanAmount) {
        newMortgageObj.originalLoanAmount = originalLoanAmount
      } else if (originalInterestRate) {
        newMortgageObj.originalInterestRate = originalInterestRate
      }
      newMortgageObj.financialsPresent = false
    } else if (originalLoanAmount || originalInterestRate || originationDate ||mortgageTerm ) {
      if (originalLoanAmount) {
        newMortgageObj.originalLoanAmount = originalLoanAmount
      }
      if (originalInterestRate) {
        newMortgageObj.originalInterestRate = originalInterestRate
      }
      if (originationDate) {
        newMortgageObj.originationDate = moment(originationDate).toISOString()
        if (originationDate.length === 14) {
          originationDate = moment(originationDate, "MMM Do, YYYY").format("MMM Do, YYYY")
        } else {
          originationDate = moment(originationDate).format("MMM Do, YYYY")
        }
        newMortgageObj.originationDateLabel = originationDate
      }
      if (mortgageTerm) {
        newMortgageObj.mortgageTerm = mortgageTerm
      }
      newMortgageObj.timeframePresent = false
      newMortgageObj.financialsPresent = false
    }
    if (req.body.fileUpload) {
      newMortgageObj.timeline = [{date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'File Upload', details: timelineDetails, newMortgageTags: mortgageTagTimelineEntries}]
    } else {
      newMortgageObj.timeline = [{date: todaysDateLabel, contributor: req.body.userFullName, milestone: 'Property Saved from Search', details: timelineDetails, newMortgageTags: mortgageTagTimelineEntries}]
    }

    let newLead = null
    if (createActiveLead) {
      let detailText = ''
      if (req.body.propMixSuccessDate && req.body.attomSuccessDate && req.body.coreLogicSuccessDate) {
        detailText = 'PropMix, Attom, CoreLogic queried successfully'
      } else if (req.body.propMixSuccessDate && req.body.attomSuccessDate) {
        detailText = 'PropMix & Attom queried successfully'
      } else if (req.body.propMixSuccessDate && req.body.coreLogicSuccessDate) {
        detailText = 'PropMix & CoreLogic queried successfully'
      } else if (req.body.attomSuccessDate && req.body.coreLogicSuccessDate) {
        detailText = 'Attom & CoreLogic queried successfully'
      } else if (req.body.propMixSuccessDate) {
        detailText = 'PropMix queried successfully'
      } else if (req.body.attomSuccessDate) {
        detailText = 'Attom queried successfully'
      } else {
        detailText = 'CoreLogic queried successfully'
      }
      newTimelineAddition = {date: todaysDateLabel, milestone: 'Discrepancies Detected', details: detailText, tier1Discrepancies: newTier1Discrepancies, tier2Discrepancies: [], tier3Discrepancies: [], newLeadTags: leadTagTimelineEntries, activeDiscrepancies: activeDiscrepanciesCount}
      newLeadObj.timeline = [newTimelineAddition]

      newMortgageObj.status = 'awaitingAction'
      newMortgageObj.activeDiscrepancies = activeDiscrepanciesCount
      newMortgageObj.activeLeadTier = activeLeadTier
      newMortgageObj.activeLead = newLeadId
      newMortgageObj.lastDiscrepanciesDiscovered = [todaysDateLabel]
      newMortgageObj.timeline.push(newTimelineAddition)
    }

    let newMortgage = new MortgageModel(newMortgageObj)
    await newMortgage.save()

    numberOfMortgages = numberOfMortgages + 1
    
    existingMortgages.push({_id: newMortgage._id, monthsRemaining: newDiffMonths})
    existingMortgages.sort(function(a,b){
      return (a.monthsRemaining) - (b.monthsRemaining);
    })
    let mortgageIds = []
    for (i = 0; i < existingMortgages.length; i++) {
      mortgageIds.push(existingMortgages[i]._id)
    }
    let teamUpdateObj = {
      mortgages: mortgageIds,
    }

    if (newFinancials && saveFromSearch) {
      teamUpdateObj.$inc = {
        totalOriginalLoanAmount: originalLoanAmountDifference,
        totalOriginalInterest: originalInterestDifference,
        totalPrincipalRemaining: principalRemainingDifference,
        totalInterestRemaining: interestRemainingDifference,
      }
    }

    if (createActiveLead) {
      let createdLead = new ActiveLeadModel(newLeadObj)
      await createdLead.save()
      newLead = await ActiveLeadModel.findById(createdLead._id).populate('belongsToMortgage')
      if (newFinancials && newFinancials.newPortfolioStats.length > 0) {
        teamUpdateObj.$push = {
          leadsAwaitingAction: {
            $each: [ newLead._id ],
            $position: 0,
          },
          portfolioMonthlyStats: {
            $each: newFinancials.newPortfolioStats,
          },
        }
      } else {
        teamUpdateObj.$push = {
          leadsAwaitingAction: {
            $each: [ newLead._id ],
            $position: 0,
          },
        }
        
      }
    } else if (newFinancials && newFinancials.newPortfolioStats.length > 0) {
      teamUpdateObj.$push = {
        portfolioMonthlyStats: {
          $each: newFinancials.newPortfolioStats,
        },
      }
    }
  
    await team.updateOne(teamUpdateObj)

    sendApiSuccessResponse(res, {originalInterestDifference, interestRemainingDifference, originalLoanAmountDifference, principalRemainingDifference, assessmentValueDifference, newMortgage, newLead, returnLeadTags, saveFromSearch}, 'save successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Save Property from Search', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, {newLog}, error)
  }
}

module.exports = { saveFromSearch };