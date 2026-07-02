const { requestCLAccessToken } = require("./CoreLogic/queries.utils")
const { CoreLogicPropertyV2Query, AttomExpandedPropertyProfileQuery, PropMixPropertyDetailsQuery } = require("./Queries/BasicPropertyQueries.utils")

exports.fetchBasicPropertyData = async function (streetAddress, city, state, postalCode, unitNumber, propMixPropertyID, attomPropertyID, coreLogicPropertyID, newlyGeneratedCoreLogicAccessToken) {
  let queryErrors = {
    propMixNotFound: false,
    propMixMissingRecords: false,
    propMixBrokenConnection: false,
    propMixObject: {},
    propMixImproperQuery: false,
    attomNotFound: false,
    attomMissingRecords: false,
    attomBrokenConnection: false,
    attomObject: {},
    attomImproperQuery: false,
    coreLogicNotFound: false,
    coreLogicMissingRecords: false,
    coreLogicBrokenConnection: false,
    coreLogicObject: {},
    coreLogicImproperQuery: false,
    coreLogicUnauthorizedQuery: false,
  }
  let successfulQueries = {
    propMix: false,
    attom: false,
    coreLogic: false,
  }
  let queryAddresses = {
    propMix: '',
    attomId: '',
    coreLogic: '',
  }
  let responseData = {
    propMix: {},
    attom: {},
    coreLogic: {},
  }
  
  //* Perform PropMix query
  let propMixResponse = {}
  let propMixEndPointURL = ''
  let propMixQueryAddress = ''
  if (propMixPropertyID) {
    propMixQueryAddress = propMixPropertyID
    propMixEndPointURL = `https://api.propmix.io/pubrec/assessor/v1/GetPropertyDetails?orderId=pubRec&PMXPropertyId=` + propMixPropertyID
  } else {
    if (postalCode) {
      propMixQueryAddress = propMixQueryAddress + `PostalCode=${postalCode}`
    }
    if (state) {
      if (propMixQueryAddress.length > 0) {
        propMixQueryAddress = propMixQueryAddress + `&State=${state}`
      } else {
        propMixQueryAddress = `State=${state}`
      }
    }
    if (city) {
      if (propMixQueryAddress.length > 0) {
        propMixQueryAddress = propMixQueryAddress + `&City=${city}`
      } else {
        propMixQueryAddress = `City=${city}`
      }
    }
    if (unitNumber) {
      if (propMixQueryAddress.length > 0) {
        propMixQueryAddress = propMixQueryAddress + `&UnitNumber=${unitNumber}`
      } else {
        propMixQueryAddress = `UnitNumber=${unitNumber}`
      }
    }
    if (streetAddress) {
      if (propMixQueryAddress.length > 0) {
        propMixQueryAddress = propMixQueryAddress + `&StreetAddress=${streetAddress}`
      } else {
        propMixQueryAddress = `StreetAddress=${streetAddress}`
      }
    }
    propMixQueryAddress = propMixQueryAddress.replaceAll(' ', '%20')
    propMixEndPointURL = `https://api.propmix.io/pubrec/assessor/v1/GetPropertyDetails?orderId=pubRec&` + propMixQueryAddress
  }
  propMixResponse = await PropMixPropertyDetailsQuery(propMixEndPointURL, propMixQueryAddress)
  queryErrors.propMixNotFound = propMixResponse.propertyNotFound
  queryErrors.propMixMissingRecords = propMixResponse.propertyMissingRecords
  queryErrors.propMixBrokenConnection = propMixResponse.brokenConnection
  queryErrors.propMixObject = propMixResponse.failedQuery
  queryErrors.propMixImproperQuery = propMixResponse.improperQuery
  if (!propMixPropertyID) {
    if (propMixResponse.responseData.PMXPropertyId) {
      queryAddresses.propMix = propMixResponse.responseData.PMXPropertyId
    }
  }
  responseData.propMix = propMixResponse.responseData
  successfulQueries.propMix = propMixResponse.successfulQuery
  
  //* Perfrom Attom query
  let attomResponse = {}
  let attomEndPointURL = ''
  let attomQueryAddress = ''
  if (attomPropertyID) {
    attomQueryAddress = attomPropertyID
    attomEndPointURL = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile?id=` + attomPropertyID
  } else {
    if (streetAddress) {
      attomQueryAddress = `address1=${streetAddress}`
    }
    if (city) {
      if (attomQueryAddress.length > 0) {
        attomQueryAddress = attomQueryAddress + `&address2=${city}`
      } else {
        attomQueryAddress = `&address2=${city}`
      }
    }
    if (state) {
      if (attomQueryAddress.length > 0) {
        attomQueryAddress = attomQueryAddress + `%2C%20${state}`
      } else {
        attomQueryAddress = `address2=${state}`
      }
    }
    if (postalCode) {
      if (attomQueryAddress.length > 0) {
        attomQueryAddress = attomQueryAddress + `%20${postalCode}`
      } else {
        attomQueryAddress = `address2=${postalCode}`
      }
    }
    attomQueryAddress = attomQueryAddress.replaceAll(' ', '%20')
    attomEndPointURL = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile?` + attomQueryAddress
  }
  attomResponse = await AttomExpandedPropertyProfileQuery(attomEndPointURL, attomQueryAddress)
  queryErrors.attomNotFound = attomResponse.propertyNotFound
  queryErrors.attomMissingRecords = attomResponse.propertyMissingRecords
  queryErrors.attomBrokenConnection = attomResponse.brokenConnection
  queryErrors.attomObject = attomResponse.failedQuery
  queryErrors.attomImproperQuery = attomResponse.improperQuery
  if (!attomPropertyID) {
    if (attomResponse.responseData[0] && attomResponse.responseData[0].identifier && attomResponse.responseData[0].identifier.Id) {
      queryAddresses.attomId = attomResponse.responseData[0].identifier.Id
    }
  }
  responseData.attom = attomResponse.responseData[0]
  successfulQueries.attom = attomResponse.successfulQuery

  //* Perfrom CoreLogic query
  let accessTokenResp = {}
  let coreLogicResponse = {}
  let newCoreLogicAccessToken = ''
  if (!newlyGeneratedCoreLogicAccessToken) {
    accessTokenResp = await requestCLAccessToken()
    newCoreLogicAccessToken = accessTokenResp.authString
  } else {
    newCoreLogicAccessToken = newlyGeneratedCoreLogicAccessToken
  }
  if (!newlyGeneratedCoreLogicAccessToken && accessTokenResp.oAuthFailed) {
    queryErrors.coreLogicUnauthorizedQuery = true
    queryErrors.coreLogicObject = accessTokenResp.failedQuery
  } else {
    let coreLogicQueryClip = null
    if (coreLogicPropertyID) {
      coreLogicQueryClip = coreLogicPropertyID
    } else {
      let coreLogicQueryAddress = ''
      if (streetAddress) {
        coreLogicQueryAddress = `streetAddress=${streetAddress}`
      }
      if (city) {
        if (coreLogicQueryAddress.length > 0) {
          coreLogicQueryAddress = coreLogicQueryAddress + `&city=${city}`
        } else {
          coreLogicQueryAddress = `city=${city}`
        }
      }
      if (state) {
        if (coreLogicQueryAddress.length > 0) {
          coreLogicQueryAddress = coreLogicQueryAddress + `&state=${state}`
        } else {
          coreLogicQueryAddress = `city=${state}`
        }
      }
      if (postalCode) {
        if (coreLogicQueryAddress.length > 0) {
          coreLogicQueryAddress = coreLogicQueryAddress + `&zipCode=${postalCode}`
        } else {
          coreLogicQueryAddress = `zipCode=${postalCode}`
        }
      }
      let coreLogicSearchEndPointURL = `https://property.corelogicapi.com/v2/properties/search?${coreLogicQueryAddress}`
      coreLogicPropertySearchResponse = await CoreLogicPropertyV2Query(coreLogicSearchEndPointURL, coreLogicQueryAddress, newCoreLogicAccessToken)
      if (!coreLogicPropertySearchResponse.successfulQuery) {
        accessTokenResp = await requestCLAccessToken()
        if (accessTokenResp.oAuthFailed) {
          queryErrors.coreLogicUnauthorizedQuery = true
          queryErrors.coreLogicObject = accessTokenResp.failedQuery
        } else {
          newCoreLogicAccessToken = accessTokenResp.authString
          let coreLogicSearchEndPointURL = `https://property.corelogicapi.com/v2/properties/search?${coreLogicQueryAddress}`
          coreLogicPropertySearchResponse = await CoreLogicPropertyV2Query(coreLogicSearchEndPointURL, coreLogicQueryAddress, newCoreLogicAccessToken)
          if (!coreLogicPropertySearchResponse.successfulQuery) {
            queryErrors.coreLogicNotFound = coreLogicPropertySearchResponse.propertyNotFound
            queryErrors.coreLogicMissingRecords = coreLogicPropertySearchResponse.propertyMissingRecords
            queryErrors.coreLogicBrokenConnection = coreLogicPropertySearchResponse.brokenConnection
            queryErrors.coreLogicObject = coreLogicPropertySearchResponse.failedQuery
            queryErrors.coreLogicImproperQuery = coreLogicPropertySearchResponse.improperQuery
            queryErrors.coreLogicUnauthorizedQuery = coreLogicPropertySearchResponse.unauthorizedQuery
            responseData.coreLogic = coreLogicPropertySearchResponse.responseData
            successfulQueries.coreLogic = coreLogicPropertySearchResponse.successfulQuery
          } else {
            coreLogicQueryClip = coreLogicPropertySearchResponse.responseData.clip
          }
        }
      } else {
        coreLogicQueryClip = coreLogicPropertySearchResponse.responseData.clip
      }
    }
    if (coreLogicQueryClip) {
      let coreLogicMortgageEndPointURL = `https://property.corelogicapi.com/v2/properties/${coreLogicQueryClip}/mortgage/current`
      coreLogicResponse = await CoreLogicPropertyV2Query(coreLogicMortgageEndPointURL, coreLogicQueryClip, newCoreLogicAccessToken)
      if (!coreLogicResponse.successfulQuery) {
        queryErrors.coreLogicNotFound = coreLogicResponse.propertyNotFound
        queryErrors.coreLogicMissingRecords = coreLogicResponse.propertyMissingRecords
        queryErrors.coreLogicBrokenConnection = coreLogicResponse.brokenConnection
        queryErrors.coreLogicObject = coreLogicResponse.failedQuery
        queryErrors.coreLogicImproperQuery = coreLogicResponse.improperQuery
        queryErrors.coreLogicUnauthorizedQuery = coreLogicResponse.unauthorizedQuery
      } else {
        queryAddresses.coreLogic = coreLogicQueryClip
        responseData.coreLogic = coreLogicResponse.responseData
        successfulQueries.coreLogic = coreLogicResponse.successfulQuery
      }
    }
  }

  return {queryErrors, queryAddresses, responseData, successfulQueries, newCoreLogicAccessToken}
}