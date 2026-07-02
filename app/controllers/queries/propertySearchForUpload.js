const moment = require('moment');
const MortgageModel = require('../../models/mortgage');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { vendorDataModeling } = require('../../utils/modeling.utils');
const { fetchBasicPropertyData } = require('../../utils/publicRecordQueries.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function propertySearchForUpload(req, res) {
  try{
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info("*** Running a Property Search for upload")

    let todaysDate = moment(new Date())
    let todaysDateLabel = todaysDate.format("MMM Do, YYYY")
    
    let existingMortgage = await MortgageModel.findOne({streetAddress: req.body.streetAddress.trim().toUpperCase()})
    if (!existingMortgage) {
      let includesApt = req.body.streetAddress.toUpperCase().includes('APT')
      if (includesApt) {
        let replaceApt = req.body.streetAddress.replace('APT', "UNIT")
        existingMortgage = await MortgageModel.findOne({streetAddress: replaceApt.trim().toUpperCase()})
      }
    }

    let failureObj = {}
    //* Determine success
    if (existingMortgage && existingMortgage.streetAddress) {
      failureObj = {
        streetAddress: req.body.streetAddress.toUpperCase(),
        city: req.body.city.toUpperCase(),
        state: req.body.state.trim().toUpperCase(),
        postalCode: req.body.postalCode.toUpperCase(),
      }
      
      sendApiSuccessResponse(res, {failureObj}, 'existing mortgage')
      console.info("*** Existing Mortgage in Repository")
      console.info('')
    } else {
      let basicPropertyData = await fetchBasicPropertyData(req.body.streetAddress, req.body.city, req.body.state, req.body.postalCode, req.body.unitNumber)
  
      if ((basicPropertyData.queryErrors.propMixMissingRecords || basicPropertyData.queryErrors.propMixNotFound) && (basicPropertyData.queryErrors.attomMissingRecords || basicPropertyData.queryErrors.attomNotFound) && (basicPropertyData.queryErrors.coreLogicMissingRecords || basicPropertyData.queryErrors.coreLogicNotFound)) {
        failureObj = {
          streetAddress: req.body.streetAddress.toUpperCase(),
          city: req.body.city.toUpperCase(),
          state: req.body.state.trim().toUpperCase(),
          postalCode: req.body.postalCode.toUpperCase(),
        }
  
        sendApiSuccessResponse(res, {failureObj}, 'no results')
        console.info("*** No Results")
        console.info('')
      } else if (!basicPropertyData.successfulQueries.propMix && !basicPropertyData.successfulQueries.attom && !basicPropertyData.successfulQueries.coreLogic) {
        let streetAddress = req.body.streetAddress
        if (streetAddress) {
          streetAddress = streetAddress.toUpperCase()
        }
        let city = req.body.city
        if (city) {
          city = city.toUpperCase()
        }
        let state = req.body.state
        if (state) {
          state = state.toUpperCase()
        }
        let postalCode = req.body.postalCode
        failureObj = {
          streetAddress: streetAddress,
          city: city,
          state: state,
          postalCode: postalCode,
        }
  
        sendApiSuccessResponse(res, {failureObj}, 'error')
        console.info("*** No Results")
        console.info('')
      } else {
        //* Mapping
        let mappedVendorData = await vendorDataModeling(basicPropertyData.successfulQueries.propMix, basicPropertyData.successfulQueries.attom, basicPropertyData.successfulQueries.coreLogic, basicPropertyData.responseData.propMix, basicPropertyData.responseData.attom, basicPropertyData.responseData.coreLogic)
  
        if (!mappedVendorData.mappedVendorObj.address.StreetAddressOneLine.publicRecordValue.length > 0) {
          let streetAddress = req.body.streetAddress
          if (streetAddress) {
            streetAddress = streetAddress.toUpperCase()
          }
          let city = req.body.city
          if (city) {
            city = city.toUpperCase()
          }
          let state = req.body.state
          if (state) {
            state = state.toUpperCase()
          }
          mappedVendorData.mappedVendorObj.address.StreetAddressLine1.publicRecordValue = streetAddress
          mappedVendorData.mappedVendorObj.address.City.publicRecordValue = city
          mappedVendorData.mappedVendorObj.address.StateOrProvince.publicRecordValue = state
          mappedVendorData.mappedVendorObj.address.PostalCode.publicRecordValue = req.body.postalCode
        }

        let recordDetailsObj = mappedVendorData.mappedVendorObj
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
        
        sendApiSuccessResponse(res, {recordDetailsObj, propMixSuccessDate, attomSuccessDate, coreLogicSuccessDate, existingMortgage}, 'search successful!');        
        console.info("*** Success")
        console.info('')
      }
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

module.exports = { propertySearchForUpload }