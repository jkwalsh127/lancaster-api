const moment = require('moment');
const UserModel = require('../../models/user');
const TeamModel = require('../../models/team');
const LeadTagModel = require('../../models/leadTag');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const MortgageTagModel = require('../../models/mortgageTag');
const { compareRecords } = require('../../utils/compareRecords.utils');
const SweepParameterModel = require('../../models/sweepParameter');
const { updateTimeframe } = require('../../utils/mortgages/updateTimeframe.utils');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { provideFinancials } = require('../../utils/mortgages/provideFinancials.utils');
const { vendorDataModeling } = require('../../utils/modeling.utils');
const { fetchBasicPropertyData } = require('../../utils/publicRecordQueries.utils');
const { mortgageTagAPIMappings, leadTagAPIMappings } = require('../../utils/tags/mapping.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');
const { gatherMortgageTagFields, gatherLeadTagFields } = require('../../utils/tags/gatherFields.utils');

async function runSweep(req, res) {
  try {
    console.info('****************************************')
    console.info('********* PUBLIC RECORDS QUERY *********')
    console.info('****************************************')
    console.time('elapsed-time')
    let mortgageId = req.body.mortgageId
    let isSingleScan = req.body.isSingleScan
    let querySettings = req.body.querySettings
    let skipNewVendorRejections = req.body.querySettings.skipNewVendorRejections
    let skipMissingVendorRejections = req.body.querySettings.skipMissingVendorRejections
    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
  
    let newLead = {}
    let updatedLead = {}
    let newMortgage = {}
    let attomNotFound = {}
    let propMixNotFound = {}
    let attomMissingRecords = {}
    let propMixMissingRecords = {}
    let completeMissingRecords = {}
    let clCurrentMortgageNotFound = {}
    let clCurrentMortgageMissingRecords = {}
    let totalUpdated = false
    let totalQueried = false
    let totalNewLeads = false
    let newTier1Count = false
    let newTier2Count = false
    let updatedTier2Count = false
    let updatedTier1Count = false
    let rejectionAttomNew = false
    let upgradedTier2Count = false
    let totalInactiveLeads = false
    let totalNewTier1Leads = false
    let totalNewTier2Leads = false
    let totalFailedQueries = false
    let rejectionCoreLogicNew = false
    let totalSuccessfulQueries = false
    let attomSuccessfulQueries = false
    let leadsWithUpgradedTiers = false
    let removeLeadAwaitingUpdate = false
    let propMixSuccessfulQueries = false
    let newLeadObjforNotification = null
    let rejectionAttomDataExpected = false
    let newLeadsAwaitingVerification = false
    let rejectionAttomAndCoreLogicNew = false
    let rejectionCoreLogicDataExpected = false
    let rejectionAttomAndCoreLogicExpected = false
    let clCurrentMortgageSuccessfulQueries = false
    let improperQueries = []
    let formattingErrors = []
    let completeNotFound = []
    let brokenConnections = []
    let totalDiscrepancies = 0
    let totalTier1Discrepancies = 0
    let totalTier2Discrepancies = 0
    let totalTier3Discrepancies = 0
    let assessmentValueDifference = req.body.assessmentValueDifference
    let newTeamLeadsAwaitingAction = '' 
    let originalInterestDifference = req.body.originalInterestDifference
    let interestRemainingDifference = req.body.interestRemainingDifference
    let originalLoanAmountDifference = req.body.originalLoanAmountDifference
    let principalRemainingDifference = req.body.principalRemainingDifference
    let newlyGeneratedCoreLogicAccessToken = req.body.newlyGeneratedCoreLogicAccessToken

    let team = await TeamModel.findById(req.body.teamId).populate('sweepParameters').populate('leadTags').populate('mortgageTags').select('sweepParameters defaultTargetInterestRate leadTags mortgageTags defaultTargetTerm')
    let teamLeadTags = team.leadTags
    let sweepParameters = team.sweepParameters
    let teamMortgageTags = team.mortgageTags
    let defaultTargetTerm = team.defaultTargetTerm
    let defaultTargetInterestRate = team.defaultTargetInterestRate
    
    let mortgage = await MortgageModel.findById(mortgageId).select('propMixSuccessDate attomSuccessDate coreLogicSuccessDate recordDetails publicRecords endDate mortgageTerm originalInterestRate timeline reports activeLead recordSweeps originationDate originationDateLabel tagAdded tags attomPropertyID propMixPropertyID coreLogicPropertyID successfulPropMix successfulAttom propertyType status parcelNumber streetAddress city state postalCode unitNumber originalLoanAmount tagIds activeDiscrepancies rejectedDiscrepancies resolvedDiscrepancies streetAddress city state postalCode financialsPresent monthsRemaining monthlyPayments principalPaid interestPaid principalRemaining interestRemaining')
      
    console.info('******************************************')
    console.info(`********* MORTGAGE ${mortgageId} *********`)
    console.info('******************************************')
    if (mortgage) {
      totalQueried = true
      let newOriginationDate = mortgage.originationDate
      let newOriginationDateLabel = mortgage.originationDateLabel
      let newMortgageTerm = mortgage.mortgageTerm
      let newOriginalInterestRate = mortgage.originalInterestRate
      let newOriginalLoanAmount = mortgage.originalLoanAmount
      let newParcelNumber = mortgage.parcelNumber
      let newPropertyType = mortgage.propertyType
      let propMixPropertyID = mortgage.propMixPropertyID
      let attomPropertyID = mortgage.attomPropertyID
      let coreLogicPropertyID = mortgage.coreLogicPropertyID
      let mortgageLead = {}
      let mortgageHasActiveLead = false
      let newStatus = ''
      let leadAwaitingUpdates = false

      let mortgageTagFields = await gatherMortgageTagFields(mortgage.tags)
      let existingMortgageTags = mortgage.tags
      let existingMortgageTagBooleans = mortgageTagFields.existingMortgageTagBooleans
      let existingMortgageTagFieldArrays = mortgageTagFields.existingMortgageTagFieldArrays

      let existingLeadTags = []
      let updatedLeadTags = []
      let leadTagIds = []
      let activeLeadTier = null
      if (mortgage.activeLead) {
        mortgageHasActiveLead = true
        mortgageLead = await ActiveLeadModel.findById(mortgage.activeLead).select('tags tagIds status awaitingUpdates targetInterestRate originalDiscrepancies tier')
        activeLeadTier = mortgageLead.tier
        defaultTargetInterestRate = mortgageLead.targetInterestRate
        leadAwaitingUpdates = mortgageLead.awaitingUpdates
        existingLeadTags = mortgageLead.tags
        updatedLeadTags = existingLeadTags
        leadTagIds = mortgageLead.tagIds
      }
      let leadTagFields = await gatherLeadTagFields(existingLeadTags)
      let existingLeadTagBooleans = leadTagFields.existingLeadTagBooleans
      let existingLeadTagFieldArrays = leadTagFields.existingLeadTagFieldArrays
      let updatedMortgageTags = mortgage.tags
      let mortgageTagIds = mortgage.tagIds

      //* Perform Public Records Query
      let basicPropertyData = await fetchBasicPropertyData(mortgage.streetAddress, mortgage.city, mortgage.state, mortgage.postalCode, mortgage.unitNumber, mortgage.propMixPropertyID, mortgage.attomPropertyID, mortgage.coreLogicPropertyID, newlyGeneratedCoreLogicAccessToken)
      newlyGeneratedCoreLogicAccessToken = basicPropertyData.newCoreLogicAccessToken
      if (!mortgage.propMixPropertyID) {
        if (basicPropertyData.successfulQueries.propMix) {
          propMixPropertyID = basicPropertyData.queryAddresses.propMix
        }
      }
      if (!mortgage.attomPropertyID) {
        if (basicPropertyData.successfulQueries.attom) {
          attomPropertyID = basicPropertyData.queryAddresses.attomId
        }
      }

      if (isSingleScan) {
        await team.updateOne({$inc: { remainingMonthlyQueries: -1 }})
      }
      
      //* Record Query Connections or Failures
      if (basicPropertyData.queryErrors.clAccessTokenFailure) {
        clCurrentMortgageNotFound = basicPropertyData.queryErrors.coreLogicObject
      }
      if (basicPropertyData.queryErrors.coreLogicUnauthorizedQuery) {
        improperQueries.push(basicPropertyData.queryErrors.coreLogicObject)
      }
      if (basicPropertyData.queryErrors.propMixMissingRecords || basicPropertyData.queryErrors.attomMissingRecords || basicPropertyData.queryErrors.coreLogicMissingRecords) {
        if (basicPropertyData.queryErrors.propMixMissingRecords && basicPropertyData.queryErrors.attomMissingRecords && basicPropertyData.queryErrors.coreLogicMissingRecords) {
          let failureObj = {
            providers: 'PropMix & Attom & CoreLogicCurrentMortgage',
            code: basicPropertyData.queryErrors.propMixObject.Code,
            type: basicPropertyData.queryErrors.propMixObject.Type,
            data: basicPropertyData.queryErrors.propMixObject.Data,
            headers: basicPropertyData.queryErrors.propMixObject.headers,
            method: basicPropertyData.queryErrors.propMixObject.method,
            url: basicPropertyData.queryErrors.propMixObject.url,
            propMixAttempt: basicPropertyData.queryAddresses.propMix,
            attomAttempt: basicPropertyData.queryAddresses.attom,
            clCurrentMortgageAttempt: basicPropertyData.queryAddresses.coreLogic,
          }
          completeMissingRecords = failureObj
        } else {
          if (basicPropertyData.queryErrors.propMixMissingRecords) {
            propMixMissingRecords = basicPropertyData.queryErrors.propMixObject
          } 
          if (basicPropertyData.queryErrors.attomMissingRecords) {
            attomMissingRecords = basicPropertyData.queryErrors.attomObject
          }
          if (basicPropertyData.queryErrors.coreLogicMissingRecords) {
            clCurrentMortgageMissingRecords = basicPropertyData.queryErrors.coreLogicObject
          }
        }
      }
      if (basicPropertyData.queryErrors.propMixNotFound || basicPropertyData.queryErrors.attomNotFound || basicPropertyData.queryErrors.coreLogicNotFound) {
        if (basicPropertyData.queryErrors.propMixNotFound && basicPropertyData.queryErrors.attomNotFound && basicPropertyData.queryErrors.coreLogicNotFound) {
          let failureObj = {
            providers: 'PropMix & Attom & CoreLogicCurrentMortgage',
            code: basicPropertyData.queryErrors.propMixObject.Code,
            type: basicPropertyData.queryErrors.propMixObject.Type,
            data: basicPropertyData.queryErrors.propMixObject.Data,
            headers: basicPropertyData.queryErrors.propMixObject.headers,
            method: basicPropertyData.queryErrors.propMixObject.method,
            url: basicPropertyData.queryErrors.propMixObject.url,
            propMixAttempt: basicPropertyData.queryAddresses.propMix,
            attomAttempt: basicPropertyData.queryAddresses.attom,
            clCurrentMortgageAttempt: basicPropertyData.queryAddresses.coreLogic,
          }
          completeNotFound.push(failureObj)
        } else {
          if (basicPropertyData.queryErrors.propMixNotFound) {
            propMixNotFound = basicPropertyData.queryErrors.propMixObject
          } 
          if (basicPropertyData.queryErrors.attomNotFound) {
            attomNotFound = basicPropertyData.queryErrors.attomObject
          }
          if (basicPropertyData.queryErrors.coreLogicNotFound) {
            clCurrentMortgageNotFound = basicPropertyData.queryErrors.coreLogicObject
          }
        }
      }
      if (basicPropertyData.queryErrors.propMixBrokenConnection || basicPropertyData.queryErrors.attomBrokenConnection || basicPropertyData.queryErrors.coreLogicBrokenConnection) {
        if (basicPropertyData.queryErrors.propMixBrokenConnection && basicPropertyData.queryErrors.attomBrokenConnection && basicPropertyData.queryErrors.coreLogicBrokenConnection) {
          let failureObj = {
            providers: 'PropMix & Attom & CoreLogicCurrentMortgage',
            code: basicPropertyData.queryErrors.propMixObject.Code,
            type: basicPropertyData.queryErrors.propMixObject.Type,
            data: basicPropertyData.queryErrors.propMixObject.Data,
            headers: basicPropertyData.queryErrors.propMixObject.headers,
            method: basicPropertyData.queryErrors.propMixObject.method,
            url: basicPropertyData.queryErrors.propMixObject.url,
            propMixAttempt: basicPropertyData.queryAddresses.propMix,
            attomAttempt: basicPropertyData.queryAddresses.attom,
            clCurrentMortgageAttempt: basicPropertyData.queryAddresses.coreLogic,
          }
          brokenConnections.push(failureObj)
        } else {
          if (basicPropertyData.queryErrors.propMixBrokenConnection) {
            brokenConnections.push(basicPropertyData.queryErrors.propMixObject)
          } 
          if (basicPropertyData.queryErrors.attomBrokenConnection) {
            brokenConnections.push(basicPropertyData.queryErrors.attomObject)
          }
          if (basicPropertyData.queryErrors.coreLogicBrokenConnection) {
            brokenConnections.push(basicPropertyData.queryErrors.coreLogicObject)
          }
        }
      }
      if (basicPropertyData.queryErrors.coreLogicImproperQuery || basicPropertyData.queryErrors.attomImproperQuery || basicPropertyData.queryErrors.coreLogicImproperQuery) {
        if (basicPropertyData.queryErrors.coreLogicImproperQuery && basicPropertyData.queryErrors.attomImproperQuery && basicPropertyData.queryErrors.coreLogicImproperQuery) {
          let failureObj = {
            providers: 'PropMix & Attom & CoreLogicCurrentMortgage',
            code: basicPropertyData.queryErrors.propMixObject.Code,
            type: basicPropertyData.queryErrors.propMixObject.Type,
            data: basicPropertyData.queryErrors.propMixObject.Data,
            headers: basicPropertyData.queryErrors.propMixObject.headers,
            method: basicPropertyData.queryErrors.propMixObject.method,
            url: basicPropertyData.queryErrors.propMixObject.url,
            propMixAttempt: basicPropertyData.queryAddresses.propMix,
            attomAttempt: basicPropertyData.queryAddresses.attom,
            clCurrentMortgageAttempt: basicPropertyData.queryAddresses.coreLogic,
          }
          completeNotFound.push(failureObj)
        } else {
          if (basicPropertyData.queryErrors.coreLogicImproperQuery) {
            improperQueries.push(basicPropertyData.queryErrors.propMixObject)
          } 
          if (basicPropertyData.queryErrors.attomImproperQuery) {
            improperQueries.push(basicPropertyData.queryErrors.attomObject)
          }
          if (basicPropertyData.queryErrors.coreLogicImproperQuery) {
            improperQueries.push(basicPropertyData.queryErrors.coreLogicObject)
          }
        }
      }
      if (basicPropertyData.successfulQueries.propMix || basicPropertyData.successfulQueries.attom || basicPropertyData.successfulQueries.coreLogic) {
        if (basicPropertyData.successfulQueries.propMix) {
          propMixSuccessfulQueries = true
        }
        if (basicPropertyData.successfulQueries.attom) {
          attomSuccessfulQueries = true
        }
        if (basicPropertyData.successfulQueries.coreLogic) {
          clCurrentMortgageSuccessfulQueries = true
        }
        totalSuccessfulQueries = true
      } else {
        totalFailedQueries = true
      }
      let detailText = ''
      let attomSuccessDate = mortgage.attomSuccessDate
      let propMixSuccessDate = mortgage.propMixSuccessDate
      let coreLogicSuccessDate = mortgage.coreLogicSuccessDate
      if (basicPropertyData.successfulQueries.propMix && basicPropertyData.successfulQueries.attom && basicPropertyData.successfulQueries.coreLogic) {
        detailText = 'PropMix, Attom, CoreLogic queried successfully'
        attomSuccessDate = todaysDateLabel
        propMixSuccessDate = todaysDateLabel
        coreLogicSuccessDate = todaysDateLabel
      } else if (basicPropertyData.successfulQueries.propMix && basicPropertyData.successfulQueries.attom) {
        detailText = 'PropMix & Attom queried successfully'
        attomSuccessDate = todaysDateLabel
        propMixSuccessDate = todaysDateLabel
      } else if (basicPropertyData.successfulQueries.propMix && basicPropertyData.successfulQueries.coreLogic) {
        detailText = 'PropMix & CoreLogic queried successfully'
        propMixSuccessDate = todaysDateLabel
        coreLogicSuccessDate = todaysDateLabel
      } else if (basicPropertyData.successfulQueries.attom && basicPropertyData.successfulQueries.coreLogic) {
        detailText = 'Attom & CoreLogic queried successfully'
        attomSuccessDate = todaysDateLabel
        coreLogicSuccessDate = todaysDateLabel
      } else if (basicPropertyData.successfulQueries.propMix) {
        detailText = 'PropMix queried successfully'
        propMixSuccessDate = todaysDateLabel
      } else if (basicPropertyData.successfulQueries.attom) {
        detailText = 'Attom queried successfully'
        attomSuccessDate = todaysDateLabel
      } else {
        detailText = 'CoreLogic queried successfully'
        coreLogicSuccessDate = todaysDateLabel
      }

      //* If this isn't an initial match, do not proceed if a successful query was performed for a vendor that had previously failed on this property
      //* -> the rejections will be sent to the user to confirm if they want to 'skipNewVendorRejections'
      if (querySettings.initialMatch === 'false' && !skipNewVendorRejections && ((coreLogicSuccessDate.length > 0 && mortgage.coreLogicSuccessDate.length === 0) || (attomSuccessDate.length > 0 && mortgage.attomSuccessDate.length === 0))) {
        if ((coreLogicSuccessDate.length > 0 && mortgage.coreLogicSuccessDate.length === 0) && (attomSuccessDate.length > 0 && mortgage.attomSuccessDate.length === 0)) {
          rejectionAttomAndCoreLogicNew = true
        } else if (coreLogicSuccessDate.length > 0 && mortgage.coreLogicSuccessDate.length === 0) {
          rejectionCoreLogicNew = true
        } else {
          rejectionAttomNew = true
        }
      }

      //* If this isn't an initial match, do not proceed if this property had a successful query performed with a vendor previously but not here.
      //* -> the rejections will be sent to the user to confirm if they want to 'skipMissingVendorRejections'
      if (querySettings.initialMatch === 'false' && !skipMissingVendorRejections && ((coreLogicSuccessDate.length > 0 && !basicPropertyData.successfulQueries.coreLogic) || (attomSuccessDate.length > 0 && !basicPropertyData.successfulQueries.attom))) {
        if ((coreLogicSuccessDate.length > 0 && !basicPropertyData.successfulQueries.coreLogic) && (attomSuccessDate.length > 0 && !basicPropertyData.successfulQueries.attom)) {
          rejectionAttomAndCoreLogicExpected = true
        } else if (coreLogicSuccessDate.length > 0 && !basicPropertyData.successfulQueries.coreLogic) {
          rejectionCoreLogicDataExpected = true
        } else {
          rejectionAttomDataExpected = true
        }
      }
      
      //* If all queries fail, update the mortgage
      if ((basicPropertyData.queryErrors.propMixMissingRecords && basicPropertyData.queryErrors.attomMissingRecords && basicPropertyData.queryErrors.coreLogicMissingRecords) || (basicPropertyData.queryErrors.propMixNotFound && basicPropertyData.queryErrors.attomNotFound && basicPropertyData.queryErrors.coreLogicNotFound)) {
        console.info('--- Records not found')
        newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), {
          lastUpdateDate: todaysDateLabel,
          recordSweeps: (mortgage.recordSweeps + 1),
        }, {new: true})
      //* Map Vendor Data to the Data Model and compare public records to existing records
      } else if (!rejectionAttomNew && !rejectionCoreLogicNew && !rejectionAttomAndCoreLogicNew && !rejectionAttomDataExpected && !rejectionCoreLogicDataExpected && !rejectionAttomAndCoreLogicExpected) {
        let mappedVendorData = await vendorDataModeling(basicPropertyData.successfulQueries.propMix, basicPropertyData.successfulQueries.attom, basicPropertyData.successfulQueries.coreLogic, basicPropertyData.responseData.propMix, basicPropertyData.responseData.attom, basicPropertyData.responseData.coreLogic, newPropertyType, querySettings.initialMatch)
        formattingErrors = mappedVendorData.formattingErrors
        if (!newOriginalLoanAmount) {
          newOriginalLoanAmount = mappedVendorData.mortgageOverview.newOriginalLoanAmount
        }
        if (!newOriginalInterestRate) {
          newOriginalInterestRate = mappedVendorData.mortgageOverview.newOriginalInterestRate
        }
        if (!newMortgageTerm) {
          newMortgageTerm = mappedVendorData.mortgageOverview.newMortgageTerm
        }
        if (mappedVendorData.mortgageOverview.newOriginationDate) {
          newOriginationDate = mappedVendorData.mortgageOverview.newOriginationDate
          newOriginationDateLabel = mappedVendorData.mortgageOverview.newOriginationDateLabel
        }
        if (!newParcelNumber) {
          newParcelNumber = mappedVendorData.newParcelNumber
        }
        let recordComparison = await compareRecords(mappedVendorData.mappedVendorObj, mortgage.recordDetails, sweepParameters, activeLeadTier, querySettings, teamLeadTags, teamMortgageTags, leadAwaitingUpdates, mortgageHasActiveLead, mortgageLead.tags, existingLeadTagFieldArrays, existingMortgageTagFieldArrays, querySettings.initialMatch, skipNewVendorRejections, skipMissingVendorRejections)
        if (!mortgage.coreLogicPropertyID) {
          if (basicPropertyData.successfulQueries.coreLogic) {
            coreLogicPropertyID = basicPropertyData.queryAddresses.coreLogic
            await SweepParameterModel.findOneAndUpdate({apiMapping: 'CoreLogicClip'}, {
              $inc: { 
                populated: 1,
                totalQueries: 1,
              },
            }, {new: true})
          } else {
            await SweepParameterModel.findOneAndUpdate({apiMapping: 'CoreLogicClip'}, {
              $inc: { 
                empty: 1,
                totalQueries: 1,
              },
            }, {new: true})
          }
        }
        assessmentValueDifference = recordComparison.assessmentValueDifference
        publicRecordsUpdated = recordComparison.publicRecordsUpdated
        if (mortgage.status === 'awaitingUpdate') {
          newStatus = 'awaitingUpdate'
          if (publicRecordsUpdated && recordComparison.recordUpdatesDontMatchEntirely) {
            newLeadsAwaitingVerification = false
            leadAwaitingUpdates = false
          } else if (publicRecordsUpdated) {
            newLeadsAwaitingVerification = true
            leadAwaitingUpdates = false
            removeLeadAwaitingUpdate = true
          }
        } else if (recordComparison.createNew && mortgage.status === 'inactive' && querySettings.createLead === 'true') {
          newStatus = 'awaitingAction'
        } else {
          newStatus = mortgage.status
        }

        //* Handle Tag updates
        //* Lead Tags
        let leadTagTimelineEntries = []
        for (let j = 0; j < Object.entries(recordComparison.leadTagUpdatedBooleans).length; j++) {
          if (Object.entries(recordComparison.leadTagUpdatedBooleans)[j][1] === true) {
            let thisTag = teamLeadTags.find(tag => tag.apiMapping === leadTagAPIMappings[j])
            if (existingLeadTagBooleans[leadTagAPIMappings[j]]) {
              thisExistingTag = existingLeadTags.find(tag => tag.tagId.toString() === thisTag._id.toString())
              let thisIndexTag = existingLeadTags.indexOf(thisExistingTag)
              thisExistingTag.discrepancyFields = recordComparison.updatedLeadTagFieldArrays[leadTagAPIMappings[j]]
              updatedLeadTags[thisIndexTag] = thisExistingTag
              let thisTagId = leadTagIds.find(id => id.toString() === thisTag._id.toString())
              if (thisTagId) {
                let thisIndexId = leadTagIds.indexOf(thisTagId)
                leadTagIds[thisIndexId] = thisTagId
              } else {
                leadTagIds.push(thisTag._id)
              }
            } else {
              await LeadTagModel.findByIdAndUpdate((thisTag._id), { $inc: { activeLeads: 1, currentAssignments: 1 } })
              updatedLeadTags.push({
                tagId: thisTag._id,
                apiMapping: leadTagAPIMappings[j],
                label: thisTag.label,
                description: thisTag.description,
                discrepancyFields: Object.entries(recordComparison.updatedLeadTagFieldArrays)[j][1],
                status: 'query',
              })
              leadTagIds.push(thisTag._id)
              leadTagTimelineEntries.push({
                label: thisTag.label,
                discrepancyFields: Object.entries(recordComparison.updatedLeadTagFieldArrays)[j][1],
              })
            }
          }
        }
        //* Mortgage Tags
        let mortgageTagTimelineEntries = []
        for (let j = 0; j < Object.entries(recordComparison.mortgageTagUpdatedBooleans).length; j++) {
          if (Object.entries(recordComparison.mortgageTagUpdatedBooleans)[j][1] === true) {
            let thisTag = teamMortgageTags.find(tag => tag.apiMapping === mortgageTagAPIMappings[j])
            if (existingMortgageTagBooleans[mortgageTagAPIMappings[j]]) {
              thisExistingTag = existingMortgageTags.find(tag => tag.tagId.toString() === thisTag._id.toString())
              let thisIndexTag = existingMortgageTags.indexOf(thisExistingTag)
              thisExistingTag.discrepancyFields = recordComparison.updatedMortgageTagFieldArrays[mortgageTagAPIMappings[j]]
              updatedMortgageTags[thisIndexTag] = thisExistingTag
              let thisTagId = mortgageTagIds.find(id => id.toString() === thisTag._id.toString())
              if (thisTagId) {
                let thisIndex = mortgageTagIds.indexOf(thisTagId)
                mortgageTagIds[thisIndex] = thisTagId
              } else {
                mortgageTagIds.push(thisTag._id)
              }
            } else {
              if (recordComparison.createNew && querySettings.initialMatch === 'true') {
                await MortgageTagModel.findByIdAndUpdate((thisTag._id), { $inc: { activeLeads: 1, currentAssignments: 1, currentMortgages: 1 } })
              } else if (recordComparison.createNew) {
                await MortgageTagModel.findByIdAndUpdate((thisTag._id), { $inc: { activeLeads: 1, currentAssignments: 1 } })
              } else if (querySettings.initialMatch === 'true') {
                await MortgageTagModel.findByIdAndUpdate((thisTag._id), { $inc: { currentMortgages: 1 } })
              }
              updatedMortgageTags.push({
                tagId: thisTag._id,
                apiMapping: mortgageTagAPIMappings[j],
                label: thisTag.label,
                description: thisTag.description,
                discrepancyFields: Object.entries(recordComparison.updatedMortgageTagFieldArrays)[j][1],
                status: 'query',
                origin: thisTag.origin,
              })
              mortgageTagIds.push(thisTag._id)
              mortgageTagTimelineEntries.push({
                label: thisTag.label,
                discrepancyFields: Object.entries(recordComparison.updatedMortgageTagFieldArrays)[j][1],
              })
            }
          }
        }

        //* Handle Scan Stats
        totalDiscrepancies = recordComparison.mortgageDiscrepancies
        totalTier1Discrepancies = recordComparison.mortgageTier1Discrepancies
        totalTier2Discrepancies = recordComparison.mortgageTier2Discrepancies
        totalTier3Discrepancies = recordComparison.mortgageTier3Discrepancies
        if (recordComparison.createNew && querySettings.createLead === 'true' && mortgage.status === 'inactive') {
          totalNewLeads = true
        }
        if (recordComparison.totalNewTier1Leads) {
          totalNewTier1Leads = true
        }
        if (recordComparison.totalNewTier2Leads) {
          totalNewTier2Leads = true
        }
        if (recordComparison.leadsWithUpgradedTiers) {
          leadsWithUpgradedTiers = true
        }
        if (recordComparison.upgradedTier2Count) {
          upgradedTier2Count = true
        }
        if (recordComparison.newTier2Count) {
          newTier2Count = true
        }
        if (recordComparison.totalUpdated) {
          totalUpdated = true
        }
        if (recordComparison.updatedTier1Count) {
          updatedTier1Count = true
        }
        if (recordComparison.newTier1Count) {
          newTier1Count = true
        }
        if (recordComparison.totalInactiveLeads) {
          totalInactiveLeads = true
        }
        if (recordComparison.updatedTier2Count) {
          updatedTier2Count = true
        }

        //* Update Owner information?
        //* Update Mortgage records, associated Leads, and Team stats
        if (mortgageHasActiveLead) {
          console.info('--- mortgage update 1: existing lead')
          let newActive = mortgage.activeDiscrepancies + recordComparison.leadActiveDiscrepancyCount
          let newTimelineAddition = {}
          if (publicRecordsUpdated || recordComparison.leadUpdated) {
            newTimelineObj = {
              date: todaysDateLabel,
              details: detailText,
              activeDiscrepancies: newActive,
              newResolved: recordComparison.newResolvedDiscrepancies,
            }
            if (isSingleScan) {
              newTimelineObj.contributor = req.body.userFullName
            }
            if (recordComparison.newAssessmentInformation) {
              newTimelineObj.newAssessmentInformation = recordComparison.newAssessmentInformation
            }
            if (recordComparison.newTaxInformation) {
              newTimelineObj.newTaxInformation = recordComparison.newTaxInformation
            }
            if (leadTagTimelineEntries.length > 0) {
              newTimelineObj.newLeadTags = leadTagTimelineEntries
            }
            if (mortgageTagTimelineEntries.length > 0) {
              newTimelineObj.newMortgageTags = mortgageTagTimelineEntries
            }
            if (recordComparison.newTier1Discrepancies.length > 0 || recordComparison.newTier2Discrepancies.length > 0 || recordComparison.newTier3Discrepancies.length > 0) {
              newTimelineObj.tier1Discrepancies = recordComparison.newTier1Discrepancies
              newTimelineObj.tier2Discrepancies = recordComparison.newTier2Discrepancies
              newTimelineObj.tier3Discrepancies = recordComparison.newTier3Discrepancies
            }
            if (recordComparison.updatedTier1Discrepancies.length > 0 || recordComparison.updatedTier2Discrepancies.length > 0 || recordComparison.updatedTier3Discrepancies.length > 0) {
              newTimelineObj.tier1Updates = recordComparison.updatedTier1Discrepancies
              newTimelineObj.tier2Updates = recordComparison.updatedTier2Discrepancies
              newTimelineObj.tier3Updates = recordComparison.updatedTier3Discrepancies
            }
            if (recordComparison.resolvedTier1Discrepancies.length > 0 || recordComparison.resolvedTier2Discrepancies.length > 0 || recordComparison.resolvedTier3Discrepancies.length > 0) {
              newTimelineObj.tier1Resolved = recordComparison.resolvedTier1Discrepancies
              newTimelineObj.tier2Resolved = recordComparison.resolvedTier2Discrepancies
              newTimelineObj.tier3Resolved = recordComparison.resolvedTier3Discrepancies
            }
            if (publicRecordsUpdated) {
              newTimelineObj.milestone = 'Public Records Updated'
              newTimelineObj.leadAwaitingUpdates = leadAwaitingUpdates
            } else {
              newTimelineObj.milestone = 'New Discrepancies Discovered'
            }
            newTimelineAddition = newTimelineObj
          } else {
            newTimelineAddition = {date: todaysDateLabel, milestone: "Record Scanned Successfully", details: detailText, newMortgageTags: mortgageTagTimelineEntries, newResolved: recordComparison.newResolvedDiscrepancies, activeDiscrepancies: newActive}
            if (leadAwaitingUpdates) {
              newTimelineAddition.leadAwaitingUpdates = true
              // newTimelineAddition = {date: todaysDateLabel, milestone: "Record Scanned Successfully", details: detailText, newMortgageTags: mortgageTagTimelineEntries, newResolved: recordComparison.newResolvedDiscrepancies, activeDiscrepancies: newActive, leadAwaitingUpdates: true}
            // } else {
              // newTimelineAddition = {date: todaysDateLabel, milestone: "Record Scanned Successfully", details: detailText, newMortgageTags: mortgageTagTimelineEntries, newResolved: recordComparison.newResolvedDiscrepancies, activeDiscrepancies: newActive}
            }
            if (isSingleScan) {
              newTimelineAddition.contributor = req.body.userFullName
            }
            if (recordComparison.newAssessmentInformationBool) {
              newTimelineAddition.newAssessmentInformation = recordComparison.newAssessmentInformation
            }
            if (recordComparison.newTaxInformationBool) {
              newTimelineAddition.newTaxInformation = recordComparison.newTaxInformation
            }
          }
          let newRejected = mortgage.rejectedDiscrepancies + recordComparison.newRejectedDiscrepancies
          let newResolved = mortgage.resolvedDiscrepancies + recordComparison.newResolvedDiscrepancies
          let newOriginalDiscrepancies = [...mortgageLead.originalDiscrepancies]
          for (let j = 0; j < recordComparison.newOriginalDiscrepancies.length; j++) {
            let matching = mortgageLead.originalDiscrepancies.find(field => field === recordComparison.newOriginalDiscrepancies[j])
            if (!matching) {
              newOriginalDiscrepancies.push(recordComparison.newOriginalDiscrepancies[j])
            }
          }
          let leadObj = {
            tier: recordComparison.leadTierAssignment,
            tags: updatedLeadTags,
            tagIds: leadTagIds,
            oldTier: recordComparison.previousLeadTierAssignment,
            publicRecordsUpdated: publicRecordsUpdated,
            awaitingUpdates: leadAwaitingUpdates,
            originalDiscrepancies: newOriginalDiscrepancies,
            $push: { timeline: newTimelineAddition },
          }
          let mortgageObj = {
            activeDiscrepancies: newActive,
            rejectedDiscrepancies: newRejected,
            resolvedDiscrepancies: newResolved,
            originationDate: newOriginationDate,
            originationDateLabel: newOriginationDateLabel,
            awaitingUpdates: leadAwaitingUpdates,
            publicRecordsUpdated: publicRecordsUpdated,
            propertyType: mappedVendorData.newPropertyType,
            propMixSuccessDate: propMixSuccessDate,
            attomSuccessDate: attomSuccessDate,
            coreLogicSuccessDate: coreLogicSuccessDate,
            recordSweeps: (mortgage.recordSweeps + 1),
            recordDetails: recordComparison.newRecordDetails,
            propMixPropertyID: propMixPropertyID,
            attomPropertyID: attomPropertyID,
            coreLogicPropertyID: coreLogicPropertyID,
            tags: updatedMortgageTags,
            tagIds: mortgageTagIds,
            lastUpdateDate: todaysDateLabel,
            status: newStatus,
            parcelNumber: newParcelNumber,
            $push: { timeline: newTimelineAddition },
          }

          let principalRemaining = 0
          let totalPrincipalPaid = 0
          let totalInterestPaid = 0
          let interestRemaining = 0
          let principalPaid = 0
          let interestPaid = 0
          let paymentDate = 0
          if (mortgage.financialsPresent) {
            let monthlyInterest = (Math.round((((newOriginalInterestRate/12)/100)*mortgage.principalRemaining)*10000)/10000)
            paymentDate = moment(newOriginationDate).add((((newMortgageTerm*12)-(mortgage.monthsRemaining - 1)), 'months')).format('MMM Do, YYYY')
            principalRemaining = mortgage.principalRemaining - (mortgage.monthlyPayments - monthlyInterest)
            interestRemaining = mortgage.interestRemaining - monthlyInterest
            totalPrincipalPaid = mortgage.principalPaid + (mortgage.monthlyPayments - monthlyInterest)
            totalInterestPaid = mortgage.interestPaid + monthlyInterest
            principalPaid = mortgage.monthlyPayments - monthlyInterest
            console.log(mortgage.monthlyPayments) 
            console.log(monthlyInterest)
            interestPaid = monthlyInterest
            mortgageObj.monthsRemaining = mortgage.monthsRemaining - 1
            mortgageObj.principalPaid = totalPrincipalPaid
            mortgageObj.interestPaid = totalInterestPaid
            mortgageObj.principalRemaining = principalRemaining
            mortgageObj.interestRemaining = interestRemaining
            interestRemainingDifference = monthlyInterest*-1
            principalRemainingDifference = (mortgage.monthlyPayments - monthlyInterest)*-1
          } else {
            if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0 && newOriginalLoanAmount > 0 && newOriginalInterestRate > 0 && defaultTargetInterestRate > 0) {
              let newFinancials = await provideFinancials(newOriginationDate, newMortgageTerm, todaysDate, newOriginalLoanAmount, newOriginalInterestRate, newMortgageTerm, defaultTargetInterestRate, assessmentValueDifference, fromSweep = true, req.body.teamId)
              mortgageObj.financialsPresent = true
              mortgageObj.timeframePresent = true
              mortgageObj.originationDateLabel = newFinancials.originationDateLabel
              mortgageObj.remainingTerm = newFinancials.remainingTerm
              mortgageObj.monthsRemaining = newFinancials.diffMonths
              mortgageObj.endDate = newFinancials.endDate
              mortgageObj.endDateLabel = newFinancials.endDateLabel
              mortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
              mortgageObj.originalInterestRate = newFinancials.originalInterestRate
              mortgageObj.monthlyPayments = newFinancials.monthlyPayments
              mortgageObj.originalTotalDue = newFinancials.originalTotalDue
              mortgageObj.originalInterestDue = newFinancials.originalInterestDue
              mortgageObj.principalPaid = newFinancials.principalPaid
              mortgageObj.interestPaid = newFinancials.interestPaid
              mortgageObj.principalRemaining = newFinancials.principalRemaining
              mortgageObj.interestRemaining = newFinancials.interestRemaining
              mortgageObj.payments = newFinancials.payments
              newLeadObj.targetLoanAmount = newFinancials.principalRemaining
              newLeadObj.targetInterestDue = newFinancials.targetInterestDue
              newLeadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
              newLeadObj.targetProfitNumber = newFinancials.targetProfitNumber
              newLeadObj.targetProfitPercent = newFinancials.targetProfitPercent
              interestRemainingDifference = newFinancials.interestRemaining
              principalRemainingDifference = newFinancials.principalRemaining
              originalLoanAmountDifference = newFinancials.originalLoanAmount
              originalInterestDifference = newFinancials.originalInterestDue
            } else if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0) {
              let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = true
              mortgageObj.mortgageTerm = newMortgageTerm
              mortgageObj.endDate = newTimeframe.endDate
              mortgageObj.endDateLabel = newTimeframe.endDateLabel
              mortgageObj.remainingTerm = newTimeframe.remainingTerm
              mortgageObj.originationDateLabel = newTimeframe.originationDateLabel
              mortgageObj.monthsRemaining = newTimeframe.diffMonths
            } else {
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = false
            }
          }
console.log('here')
console.log(principalPaid)
          if (mortgage.financialsPresent) {
            mortgageObj.$push = { 
              timeline: newTimelineAddition,
              payments: {
                paymentDate: paymentDate,
                interestPaid: (Math.round(interestPaid*10000)/10000),
                principalPaid: (Math.round(principalPaid*10000)/10000),
                interestRemaining: (Math.round(interestRemaining*10000)/10000),
                totalInterestPaid: (Math.round(interestRemaining*10000)/10000),
                principalRemaining: (Math.round(principalRemaining*10000)/10000),
                totalPrincipalPaid: (Math.round(principalRemaining*10000)/10000),
              },
            }
          }

          let membersAwaitingUpdates = await UserModel.find({leadsAwaitingUpdate: { $gt: 0 }}).select('_id leadsAwaitingUpdate leadsAwaitingVerification')
          newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), mortgageObj, {new: true})
          updatedLead = await ActiveLeadModel.findByIdAndUpdate((mortgage.activeLead), leadObj, {new: true}).populate('belongsToMortgage')
          if ((updatedLead.status === 'awaitingUpdate') && publicRecordsUpdated) {
            for (let j = 0; j < updatedLead.assigneeIds.length; j++) {
              let assigned = membersAwaitingUpdates.find(member => member._id.toString() === updatedLead.assigneeIds[j].toString())
              if (assigned) {
                assigned.leadsAwaitingUpdate--
                assigned.leadsAwaitingVerification++
              }
            }
          }
        } else if (recordComparison.createNew && querySettings.createLead === 'true') {
          console.info('--- mortgage update 2: no previous activeLead and createNew')
          let newTimelineAddition = {date: todaysDateLabel, milestone: 'Discrepancies Detected', details: detailText, tier1Discrepancies: recordComparison.newTier1Discrepancies, tier2Discrepancies: recordComparison.newTier2Discrepancies, tier3Discrepancies: recordComparison.newTier3Discrepancies, newLeadTags: leadTagTimelineEntries, newMortgageTags: mortgageTagTimelineEntries, activeDiscrepancies: recordComparison.leadActiveDiscrepancyCount}
          let newTimeline = [newTimelineAddition]

          let newOriginalDiscrepancies = recordComparison.newOriginalDiscrepancies
          let newLeadObj = {
            tags: updatedLeadTags,
            tagIds: leadTagIds,
            dateCreated: logTime,
            belongsToTeam: req.body.teamId,
            belongsToMortgage: mortgageId,
            status: newStatus,
            publicRecordsUpdated: publicRecordsUpdated,
            awaitingUpdates: leadAwaitingUpdates,
            tier: recordComparison.leadTierAssignment,
            dateDiscovered: todaysDateLabel,
            dateDiscoveredLabel: todaysDateLabel,
            targetLoanTerm: defaultTargetTerm,
            targetInterestRate: defaultTargetInterestRate,
            timeline: newTimeline,
            reports: mortgage.reports,
            targetOutcome: 'unassigned',
            originalDiscrepancies: newOriginalDiscrepancies,
          }
          let mortgageObj = {
            rejectedDiscrepancies: 0,
            resolvedDiscrepancies: 0,
            activeDiscrepancies: recordComparison.leadActiveDiscrepancyCount,
            activeLeadTier: recordComparison.leadTierAssignment,
            lastDiscrepanciesDiscovered: todaysDateLabel,
            awaitingUpdates: leadAwaitingUpdates,
            recordSweeps: (mortgage.recordSweeps + 1),
            recordDetails: recordComparison.newRecordDetails,
            originationDate: newOriginationDate,
            originationDateLabel: newOriginationDateLabel,
            originalLoanAmount: newOriginalLoanAmount,
            originalInterestRate: newOriginalInterestRate,
            tagIds: mortgageTagIds,
            tags: updatedMortgageTags,
            propMixPropertyID: propMixPropertyID,
            attomPropertyID: attomPropertyID,
            coreLogicPropertyID: coreLogicPropertyID,
            propMixSuccessDate: propMixSuccessDate,
            attomSuccessDate: attomSuccessDate,
            coreLogicSuccessDate: coreLogicSuccessDate,
            propertyType: mappedVendorData.newPropertyType,
            lastUpdateDate: todaysDateLabel,
            publicRecordsUpdated: publicRecordsUpdated,
            status: newStatus,
            parcelNumber: newParcelNumber,
            $push: {timeline: newTimelineAddition},
          }
          if (recordComparison.newOwner1) {
            mortgageObj.owner1 = recordComparison.newOwner1FullName
          }
          if (recordComparison.newOwner2) {
            mortgageObj.owner2 = recordComparison.newOwner2FullName
          }

          let principalRemaining = 0
          let totalPrincipalPaid = 0
          let totalInterestPaid = 0
          let interestRemaining = 0
          let principalPaid = 0
          let interestPaid = 0
          let paymentDate = 0
          if (mortgage.financialsPresent) {
            let monthlyInterest = (Math.round((((newOriginalInterestRate/12)/100)*mortgage.principalRemaining)*10000)/10000)
            paymentDate = moment(newOriginationDate).add((((newMortgageTerm*12)-(mortgage.monthsRemaining - 1)), 'months')).format('MMM Do, YYYY')
            principalRemaining = mortgage.principalRemaining - (mortgage.monthlyPayments - monthlyInterest)
            interestRemaining = mortgage.interestRemaining - monthlyInterest
            totalPrincipalPaid = mortgage.principalPaid + (mortgage.monthlyPayments - monthlyInterest)
            totalInterestPaid = mortgage.interestPaid + monthlyInterest
            principalPaid = mortgage.monthlyPayments - monthlyInterest
            interestPaid = monthlyInterest
            mortgageObj.monthsRemaining = mortgage.monthsRemaining - 1
            mortgageObj.principalPaid = totalPrincipalPaid
            mortgageObj.interestPaid = totalInterestPaid
            mortgageObj.principalRemaining = principalRemaining
            mortgageObj.interestRemaining = interestRemaining
            interestRemainingDifference = monthlyInterest*-1
            principalRemainingDifference = (mortgage.monthlyPayments - monthlyInterest)*-1
          } else {
            if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0 && newOriginalLoanAmount > 0 && newOriginalInterestRate > 0 && defaultTargetInterestRate > 0) {
              let newFinancials = await provideFinancials(newOriginationDate, newMortgageTerm, todaysDate, newOriginalLoanAmount, newOriginalInterestRate, newMortgageTerm, defaultTargetInterestRate, assessmentValueDifference, fromSweep = true, req.body.teamId)
              mortgageObj.financialsPresent = true
              mortgageObj.timeframePresent = true
              mortgageObj.originationDateLabel = newFinancials.originationDateLabel
              mortgageObj.remainingTerm = newFinancials.remainingTerm
              mortgageObj.monthsRemaining = newFinancials.diffMonths
              mortgageObj.endDate = newFinancials.endDate
              mortgageObj.endDateLabel = newFinancials.endDateLabel
              mortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
              mortgageObj.originalInterestRate = newFinancials.originalInterestRate
              mortgageObj.monthlyPayments = newFinancials.monthlyPayments
              mortgageObj.originalTotalDue = newFinancials.originalTotalDue
              mortgageObj.originalInterestDue = newFinancials.originalInterestDue
              mortgageObj.principalPaid = newFinancials.principalPaid
              mortgageObj.interestPaid = newFinancials.interestPaid
              mortgageObj.principalRemaining = newFinancials.principalRemaining
              mortgageObj.interestRemaining = newFinancials.interestRemaining
              mortgageObj.payments = newFinancials.payments
              newLeadObj.targetLoanAmount = newFinancials.principalRemaining
              newLeadObj.targetInterestDue = newFinancials.targetInterestDue
              newLeadObj.targetMonthlyPayments = newFinancials.targetMonthlyPayment
              newLeadObj.targetProfitNumber = newFinancials.targetProfitNumber
              newLeadObj.targetProfitPercent = newFinancials.targetProfitPercent
              interestRemainingDifference = newFinancials.interestRemaining
              principalRemainingDifference = newFinancials.principalRemaining
              originalLoanAmountDifference = newFinancials.originalLoanAmount
              originalInterestDifference = newFinancials.originalInterestDue
            } else if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0) {
              let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = true
              mortgageObj.mortgageTerm = newMortgageTerm
              mortgageObj.endDate = newTimeframe.endDate
              mortgageObj.endDateLabel = newTimeframe.endDateLabel
              mortgageObj.remainingTerm = newTimeframe.remainingTerm
              mortgageObj.originationDateLabel = newTimeframe.originationDateLabel
              mortgageObj.monthsRemaining = newTimeframe.diffMonths
            } else {
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = false
            }
          }
 
          let createLead = new ActiveLeadModel(newLeadObj)
          await createLead.save()
          mortgageObj.activeLead = createLead._id
          newTeamLeadsAwaitingAction = createLead._id

          if (mortgage.financialsPresent) {
            mortgageObj.$push = { 
              timeline: newTimelineAddition,
              payments: {
                paymentDate: paymentDate,
                interestPaid: (Math.round(interestPaid*10000)/10000),
                principalPaid: (Math.round(principalPaid*10000)/10000),
                interestRemaining: (Math.round(interestRemaining*10000)/10000),
                totalInterestPaid: (Math.round(interestRemaining*10000)/10000),
                principalRemaining: (Math.round(principalRemaining*10000)/10000),
                totalPrincipalPaid: (Math.round(principalRemaining*10000)/10000),
              },
            }
          }

          newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), mortgageObj, {new: true})
          newLeadObjforNotification = {
            leadId: createLead._id,
            streetAddress: mortgage.streetAddress,
            city: mortgage.city,
            state: mortgage.state,
            postalCode: mortgage.postalCode,
          }
          newLead = await ActiveLeadModel.findById(createLead._id).populate('belongsToMortgage')
        } else {
          console.info('--- mortgage update 3: no activeLead and do not createNew')
          let mortgageObj = {
            recordSweeps: (mortgage.recordSweeps + 1),
            originationDate: newOriginationDate,
            originationDateLabel: newOriginationDateLabel,
            originalLoanAmount: newOriginalLoanAmount,
            originalInterestRate: newOriginalInterestRate,
            propMixPropertyID: propMixPropertyID,
            attomPropertyID: attomPropertyID,
            coreLogicPropertyID: coreLogicPropertyID,
            propMixSuccessDate: propMixSuccessDate,
            attomSuccessDate: attomSuccessDate,
            coreLogicSuccessDate: coreLogicSuccessDate,
            propertyType: mappedVendorData.newPropertyType,
            lastUpdateDate: todaysDateLabel,
            publicRecordsUpdated: publicRecordsUpdated,
            status: newStatus,
            awaitingUpdates: leadAwaitingUpdates,
            parcelNumber: newParcelNumber,
            tags: updatedMortgageTags,
            tagIds: mortgageTagIds,
          }
          let principalRemaining = 0
          let totalPrincipalPaid = 0
          let totalInterestPaid = 0
          let interestRemaining = 0
          let principalPaid = 0
          let interestPaid = 0
          let paymentDate = 0
          if (mortgage.financialsPresent) {
            let monthlyInterest = (Math.round((((newOriginalInterestRate/12)/100)*mortgage.principalRemaining)*10000)/10000)
            paymentDate = moment(newOriginationDate).add((((newMortgageTerm*12)-(mortgage.monthsRemaining - 1)), 'months')).format('MMM Do, YYYY')
            principalRemaining = mortgage.principalRemaining - (mortgage.monthlyPayments - monthlyInterest)
            interestRemaining = mortgage.interestRemaining - monthlyInterest
            totalPrincipalPaid = mortgage.principalPaid + (mortgage.monthlyPayments - monthlyInterest)
            totalInterestPaid = mortgage.interestPaid + monthlyInterest
            principalPaid = mortgage.monthlyPayments - monthlyInterest
            interestPaid = monthlyInterest
            mortgageObj.monthsRemaining = mortgage.monthsRemaining - 1
            mortgageObj.principalPaid = totalPrincipalPaid
            mortgageObj.interestPaid = totalInterestPaid
            mortgageObj.principalRemaining = principalRemaining
            mortgageObj.interestRemaining = interestRemaining
            interestRemainingDifference = monthlyInterest*-1
            principalRemainingDifference = (mortgage.monthlyPayments - monthlyInterest)*-1
          } else {
            if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0 && newOriginalLoanAmount > 0 && newOriginalInterestRate > 0 && defaultTargetInterestRate > 0) {
              let newFinancials = await provideFinancials(newOriginationDate, newMortgageTerm, todaysDate, newOriginalLoanAmount, newOriginalInterestRate, newMortgageTerm, defaultTargetInterestRate, assessmentValueDifference, fromSweep = true, req.body.teamId)
              mortgageObj.financialsPresent = true
              mortgageObj.timeframePresent = true
              mortgageObj.originationDateLabel = newFinancials.originationDateLabel
              mortgageObj.remainingTerm = newFinancials.remainingTerm
              mortgageObj.monthsRemaining = newFinancials.diffMonths
              mortgageObj.endDate = newFinancials.endDate
              mortgageObj.endDateLabel = newFinancials.endDateLabel
              mortgageObj.originalLoanAmount = newFinancials.originalLoanAmount
              mortgageObj.originalInterestRate = newFinancials.originalInterestRate
              mortgageObj.monthlyPayments = newFinancials.monthlyPayments
              mortgageObj.originalTotalDue = newFinancials.originalTotalDue
              mortgageObj.originalInterestDue = newFinancials.originalInterestDue
              mortgageObj.principalPaid = newFinancials.principalPaid
              mortgageObj.interestPaid = newFinancials.interestPaid
              mortgageObj.principalRemaining = newFinancials.principalRemaining
              mortgageObj.interestRemaining = newFinancials.interestRemaining
              mortgageObj.payments = newFinancials.payments
              interestRemainingDifference = newFinancials.interestRemaining
              principalRemainingDifference = newFinancials.principalRemaining
              originalLoanAmountDifference = newFinancials.originalLoanAmount
              originalInterestDifference = newFinancials.originalInterestDue
            } else if ((newOriginationDate > 0 || newOriginationDate.length > 0) && newMortgageTerm > 0) {
              let newTimeframe = await updateTimeframe(newOriginationDate, newMortgageTerm, todaysDate)
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = true
              mortgageObj.mortgageTerm = newMortgageTerm
              mortgageObj.endDate = newTimeframe.endDate
              mortgageObj.endDateLabel = newTimeframe.endDateLabel
              mortgageObj.remainingTerm = newTimeframe.remainingTerm
              mortgageObj.originationDateLabel = newTimeframe.originationDateLabel
              mortgageObj.monthsRemaining = newTimeframe.diffMonths
            } else {
              mortgageObj.financialsPresent = false
              mortgageObj.timeframePresent = false
            }
          }
          mortgageObj.recordDetails = recordComparison.newRecordDetails
          if (recordComparison.newOwner1) {
            mortgageObj.owner1 = recordComparison.newOwner1FullName
          }
          if (recordComparison.newOwner2) {
            mortgageObj.owner2 = recordComparison.newOwner2FullName
          }
          let milestone = ''
          if (querySettings.initialMatch === 'true') {
            milestone = "Initial Scan Successful"
          } else {
            milestone = "Record Scanned Successfully"
          }
          let newTimelineAddition = {date: todaysDateLabel, milestone: milestone, details: detailText, newMortgageTags: mortgageTagTimelineEntries}
          if (mortgage.financialsPresent) {
            mortgageObj.$push = { 
              timeline: newTimelineAddition,
              payments: {
                paymentDate: paymentDate,
                interestPaid: (Math.round(interestPaid*10000)/10000),
                principalPaid: (Math.round(principalPaid*10000)/10000),
                interestRemaining: (Math.round(interestRemaining*10000)/10000),
                totalInterestPaid: (Math.round(interestRemaining*10000)/10000),
                principalRemaining: (Math.round(principalRemaining*10000)/10000),
                totalPrincipalPaid: (Math.round(principalRemaining*10000)/10000),
              }
            }
          } else {
            mortgageObj.$push = { timeline: newTimelineAddition }
          }
          newMortgage = await MortgageModel.findByIdAndUpdate((mortgageId), mortgageObj, {new: true})
        }
      }
    } else {
      console.info('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      console.info(`!!! MORTGAGE MISSING ${mortgageId} !!!`)
      console.info('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    }

    sendApiSuccessResponse(res, {newLead, updatedLead, newMortgage, totalUpdated, totalNewLeads, newTier1Count, newTier2Count, attomNotFound, improperQueries, propMixNotFound, formattingErrors, completeNotFound, brokenConnections, updatedTier2Count, updatedTier1Count, upgradedTier2Count, totalInactiveLeads, totalDiscrepancies, totalNewTier1Leads, totalNewTier2Leads, totalFailedQueries, attomMissingRecords, propMixMissingRecords, completeMissingRecords, removeLeadAwaitingUpdate, totalSuccessfulQueries, attomSuccessfulQueries, leadsWithUpgradedTiers, totalTier1Discrepancies, totalTier2Discrepancies, totalTier3Discrepancies, propMixSuccessfulQueries, clCurrentMortgageNotFound, newLeadsAwaitingVerification, newTeamLeadsAwaitingAction, clCurrentMortgageMissingRecords, clCurrentMortgageSuccessfulQueries, totalQueried, rejectionAttomDataExpected, rejectionCoreLogicDataExpected, rejectionAttomAndCoreLogicExpected, mortgageId, rejectionAttomNew, rejectionCoreLogicNew, rejectionAttomAndCoreLogicNew, newlyGeneratedCoreLogicAccessToken, newLeadObjforNotification, isSingleScan, originalLoanAmountDifference, originalInterestDifference, principalRemainingDifference, interestRemainingDifference, assessmentValueDifference}, 'query successful!');    
    console.info('-----------------------------------')
    console.timeEnd('elapsed-time')
    console.info('-----------------------------------')
    console.info('************************************************')
    console.info('********* QUERY COMPLETED SUCCESSFULLY *********')
    console.info('************************************************')
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Trans Pac', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { runSweep };