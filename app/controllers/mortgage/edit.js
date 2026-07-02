const moment = require('moment');
const MortgageModel = require('../../models/mortgage');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');
//TODO: This function will not only need to be built out to handle all edits, but it also isn't even complete in its current form. 
async function edit(req, res) {
  try{
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info(`*** Editing mortgage ${req.body.fieldToUpdate}`)
    let todaysDate = moment(new Date())
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")

    let newValue = req.body.newValue
    if (typeof newValue === 'string') {
      newValue = newValue.toUpperCase()
    }
    let newMortgage = {}
    if (req.body.fieldToUpdate === 'owner1') {
      let oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails owner1')
      let newDetails = oldMortgage.recordDetails
      newDetails.owner1.Owner1FullName.currentValue = newValue
      newDetails.owner1.Owner1FullName.publicRecordValue = newValue
      let newOwner = newValue
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {recordDetails: newDetails, owner1: newOwner}, {new: true})
    } else if (req.body.fieldToUpdate === 'owner2') {
      let oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails owner2 activeDiscrepancies rejectedDiscrepancies resolvedDiscrepancies')
      let newDetails = oldMortgage.recordDetails
      let newActive = oldMortgage.activeDiscrepancies
      let newRejected = oldMortgage.rejectedDiscrepancies
      let newResolved = oldMortgage.resolvedDiscrepancies
      // if (newValue !== newDetails.owner2.Owner2FullName.currentValue && newValue === newDetails.owner2.Owner2FullName.publicRecordValue) {
      //   if (newDetails.owner2.Owner2FullName.status === 'discrepancy') {
      //     newDetails.owner2.Owner2FullName.discrepancy = 'resolved'
      //     newDetails.owner2.Owner2FullName.status = 'edited'
      //     newActive--
      //     newResolved++
      //   } else {
      //     newDetails.owner2.Owner2FullName.discrepancy = 'inactive'
      //     newDetails.owner2.Owner2FullName.status = 'inactive'
      //   }
      // } else if (newValue !== newDetails.owner2.Owner2FullName.currentValue && newValue !== newDetails.owner2.Owner2FullName.publicRecordValue) {
      //   if (newDetails.owner2.Owner2FullName.status === 'discrepancy') {
      //     newActive--
      //   }
      //   newDetails.owner2.Owner2FullName.discrepancy = 'rejected'
      //   newDetails.owner2.Owner2FullName.status = 'edited'
      //   newRejected++
      // }
      // newDetails.owner2.Owner2FullName.currentValue = newValue
      newDetails.owner2.Owner2FullName.publicRecordValue = newValue
      newDetails.owner2.Owner2FullName.currentValue = newValue + ' test'
      newDetails.owner2.Owner2FullName.orignalValue = newValue + ' test'
      let newOwner = newValue
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {recordDetails: newDetails, owner2: newOwner, activeDiscrepancies: newActive, rejectedDiscrepancies: newRejected, resolvedDiscrepancies: newResolved}, {new: true})
    } else if (req.body.fieldToUpdate === 'numberOfUnits') {
      let oldMortgage = await MortgageModel.findById(req.body.mortgageId).select('recordDetails')
      let newDetails = oldMortgage.recordDetails
      newDetails.building.NumberOfUnitsTotal.currentValue = newValue
      newDetails.building.NumberOfUnitsTotal.publicRecordValue = newValue
      newMortgage = await MortgageModel.findByIdAndUpdate((req.body.mortgageId), {recordDetails: newDetails}, {new: true})
    }

    let newLog = await handleRequestLog('Log', logTime, `Mortgage Edited`, 'Trans Pac', [{type: `${req.body.fieldToUpdate}`, detail: `${req.body.newValue}`}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog, newMortgage}, 'edit successful!');    
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Run Property Search', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { edit };