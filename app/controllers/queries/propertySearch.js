const moment = require('moment');
const TeamModel = require('../../models/team');
const MortgageModel = require('../../models/mortgage');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { vendorDataModeling } = require('../../utils/modeling.utils');
const { fetchBasicPropertyData } = require('../../utils/publicRecordQueries.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function propertySearch(req, res) {
  try{
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Running a Property Search")
    
    let existingMortgage = false
    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let fileUpload = req.body.fileUpload

    let basicPropertyData = await fetchBasicPropertyData(req.body.streetAddress, req.body.city, req.body.state, req.body.postalCode, req.body.unitNumber)

    await TeamModel.findByIdAndUpdate((req.body.teamId), {$inc: { remainingMonthlyQueries: -1 }})

    //* Determine success
    let failureObj = {}
    if (!basicPropertyData.successfulQueries.propMix && !basicPropertyData.successfulQueries.attom && !basicPropertyData.successfulQueries.coreLogic) {
      failureObj = {
        details: "No Results",
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        state: req.body.state.trim(),
        postalCode: req.body.postalCode,
        apn: req.body.apn,
      }

      let newLog = await handleRequestLog('Error', logTime, 'No Results', 'Basic Property', [{type: 'Failure Obj', detail: failureObj}], 'failure', false, req.body.userFullName)
      sendApiSuccessResponse(res, {newLog}, 'no results')
      console.info("*** No Results")
      console.info('')
    } else {
      //* Mapping
      let mappedVendorData = await vendorDataModeling(basicPropertyData.successfulQueries.propMix, basicPropertyData.successfulQueries.attom, basicPropertyData.successfulQueries.coreLogic, basicPropertyData.responseData.propMix, basicPropertyData.responseData.attom, basicPropertyData.responseData.coreLogic)

      let mathedMortgage = await MortgageModel.findOne({streetAddress: req.body.streetAddress.trim().toUpperCase()}).select("_id")
      if (!mathedMortgage) {
        let includesApt = req.body.streetAddress.toUpperCase().includes('APT')
        if (includesApt) {
          let replaceApt = req.body.streetAddress.replace('APT', "UNIT")
          mathedMortgage = await MortgageModel.findOne({streetAddress: replaceApt.trim().toUpperCase()})
          if (mathedMortgage) {
            existingMortgage = true
          }
        }
      } else {
        existingMortgage = true
      }

      if (!mappedVendorData.mappedVendorObj.address.StreetAddressOneLine.publicRecordValue.length > 0) {
        mappedVendorData.mappedVendorObj.address.StreetAddressLine1.publicRecordValue = req.body.streetAddress.toUpperCase()
        mappedVendorData.mappedVendorObj.address.City.publicRecordValue = req.body.city.toUpperCase()
        mappedVendorData.mappedVendorObj.address.StateOrProvince.publicRecordValue = req.body.state.toUpperCase()
        mappedVendorData.mappedVendorObj.address.PostalCode.publicRecordValue = req.body.postalCode.toUpperCase()
      }

      let recordDetailsObj = mappedVendorData.mappedVendorObj
      let PropMixQueryAddress = basicPropertyData.queryAddresses.propMix
      let AttomQueryAddress = basicPropertyData.queryAddresses.attom
      let CoreLogicQueryAddress = basicPropertyData.queryAddresses.coreLogic
      let propMixSuccessDate = ''
      let attomSuccessDate = ''
      let coreLogicSuccessDate = ''
      if (basicPropertyData.successfulQueries.propMix) {
        propMixSuccessDate = todaysDateLabel
      }
      if (basicPropertyData.successfulQueries.attom) {
        attomSuccessDate = todaysDateLabel
      }
      if (basicPropertyData.successfulQueries.coreLogic) {
        coreLogicSuccessDate = todaysDateLabel
      }
      
      let newLog = await handleRequestLog('Log', logTime, 'Search Performed', 'Basic Property', [{}], 'success', false, req.body.userFullName)
      sendApiSuccessResponse(res, {fileUpload, recordDetailsObj, AttomQueryAddress, CoreLogicQueryAddress, PropMixQueryAddress, propMixSuccessDate, attomSuccessDate, coreLogicSuccessDate, newLog, existingMortgage, mathedMortgage}, 'search successful!');
      console.info("*** Success")
      console.info('')
    }
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

module.exports = { propertySearch }