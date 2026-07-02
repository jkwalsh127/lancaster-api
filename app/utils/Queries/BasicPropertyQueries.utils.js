const axios = require('axios');
const { CORE_LOGIC_EMAIL, ATTOM_KEY, PMX_KEY } = require("../../../config/environment");

exports.PropMixPropertyDetailsQuery = async function (endPointURL, queryAddress) {
  console.info('********* Beginning PropMix PropertyDetails query')
  let failedQuery = {}
  let responseData = {}
  let propertyNotFound = false
  let successfulQuery = false
  let propertyMissingRecords = false
  let brokenConnection = false
  let improperQuery = false
  const headers = { 'Content-Type': 'application/json', 'Access-Token' : `${PMX_KEY}` }
  const resp = await axios.get(endPointURL, { headers })  
    .catch(function (error) {
      if (error.response) {
        //* The request was made and the server responded with a status code that falls out of the range of 2xx
        failedQuery = {
          provider: 'PropMix',
          Code: error.response.status,
          Type: error.response.statusText,
          data: error.response.data,
          AddressAttempted: endPointURL,
          headers: error.response.config.headers,
          method: error.response.config.method,
          url: error.response.config.url,
        }
      } else if (error.request) {
        //* The request was made but no response was received. `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
        failedQuery = error.request
      } else {
        //* Something happened in setting up the request that triggered an Error
        failedQuery = {error: error.message}
      }
    })

    if (resp) {
    if (resp.data.Status.Code === 200) {
      if (resp.data.Status.Type === 'Data not available') {
        propertyMissingRecords = true
        failedQuery = {Vendor: 'PropMix', AddressAttempted: queryAddress, ...resp.data}
      } else { 
        successfulQuery = true
        responseData = resp.data.Data.Listing
      }
    } else {
      propertyNotFound = true
      failedQuery = {Vendor: 'PropMix', ...resp.failedQuery}
    }
  } else {
    if (failedQuery.Type === 'Data not available') {
      failedQuery = {Vendor: 'PropMix', AddressAttempted: queryAddress, Code: 200, Type: 'OK', Message: 'Data not available'}
      propertyMissingRecords = true
    } else if (failedQuery.Type === 'Unauthorized') {
      failedQuery = {Vendor: 'PropMix', AddressAttempted: queryAddress, Code: 401, Type: 'Unauthorized'}
      brokenConnection = true
    } else if (failedQuery.Code === 504) {
      failedQuery = {Vendor: 'PropMix', AddressAttempted: queryAddress, Code: 504, Type: 'Gateway Timeout', Messsage: 'Gateway Timeout'}
      brokenConnection = true
    }
  }

  return {successfulQuery, responseData, propertyNotFound, propertyMissingRecords, brokenConnection, failedQuery, improperQuery}
}

exports.AttomExpandedPropertyProfileQuery = async function (endPointURL, queryAddress) {
  console.info('********* Beginning Attom Expanded Property Profile query')
  let failedQuery = {}
  let responseData = {}
  let improperQuery = false
  let successfulQuery = false
  let brokenConnection = false
  let propertyNotFound = false
  let propertyMissingRecords = false
  const headers = { 'Content-Type': 'application/json', 'apikey' : `${ATTOM_KEY}` }
  const resp = await axios.get(endPointURL, { headers })  
    .catch(function (error) {
      if (error.response) {
        //* The request was made and the server responded with a status code that falls out of the range of 2xx
        failedQuery = {
          provider: 'Attom',
          Code: error.response.status,
          Type: error.response.statusText,
          data: error.response.data,
          AddressAttempted: endPointURL,
          headers: error.response.config.headers,
          method: error.response.config.method,
          url: error.response.config.url,
        }
      } else if (error.request) {
        //* The request was made but no response was received. `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
        failedQuery = error.request
      } else {
        //* Something happened in setting up the request that triggered an Error
        failedQuery = {error: error.message}
      }
    })

  if (resp) {
    if (resp.status === 200) {
      if (resp.data.status.msg === 'SuccessWithResult') {
        successfulQuery = true
        responseData = resp.data.property
      } else { 
        propertyMissingRecords = true
        failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, ...resp.data}
      }
    } else {
      propertyNotFound = true
      failedQuery = {Vendor: 'Attom', ...resp.failedQuery}
    }
  } else {
    if (failedQuery.Type === 'Data not available') {
      failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, Code: 200, Type: 'OK', Message: 'Data not available.'}
      propertyMissingRecords = true
    } else if (failedQuery.Type === 'Unauthorized') {
      failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, Code: 401, Type: 'Unauthorized'}
      brokenConnection = true
    } else if (failedQuery.Type === 'Bad Request') {
      failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, Code: 401, Type: 'Improper Query', Message: failedQuery.data.status.msg}
      improperQuery = true
    } else if (failedQuery.Code === 504) {
      failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, Code: 504, Type: 'Gateway Timeout', Message: 'Gateway Timeout'}
      brokenConnection = true
    } else if (failedQuery.Code === 500) {
      failedQuery = {Vendor: 'Attom', AddressAttempted: queryAddress, Code: 500, Type: 'Gateway Timeout', Message: 'Gateway Timeout'}
      brokenConnection = true
    }
  }

  return {successfulQuery, responseData, propertyNotFound, propertyMissingRecords, brokenConnection, failedQuery, improperQuery}
}

exports.CoreLogicPropertyV2Query = async function (endPointURL, queryAddress, authString) {
  console.info(`********* Beginning CoreLogic Property v2 query: ${endPointURL}`)
  let failedQuery = {}
  let responseData = {}
  let improperQuery = false
  let successfulQuery = false
  let brokenConnection = false
  let propertyNotFound = false
  let unauthorizedQuery = false
  let propertyMissingRecords = false
  const headers = {'Authorization' : `Bearer ${authString}`, 'x-developer-email': `${CORE_LOGIC_EMAIL}`, 'Content-Type': 'application/json' }
  const resp = await axios.get(endPointURL, { headers }) 
  .catch(function (error) {
    if (error.response) {
      //* The request was made and the server responded with a status code that falls out of the range of 2xx
      failedQuery = {
        Vendor: 'CoreLogic',
        Code: error.response.status,
        Type: error.response.statusText,
        data: error.response.data,
        AddressAttempted: endPointURL,
        headers: error.response.headers,
        method: error.response.config.method,
        url: error.response.config.url,
      }
    } else if (error.request) {
      //* The request was made but no response was received. `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
      failedQuery = error.request
    } else {
      //* Something happened in setting up the request that triggered an Error
      failedQuery = {error: error.message}
    }
  })
  if (resp) {
    if (resp.status === 200) {
      if (resp.data.items[0]) {
        successfulQuery = true
        responseData = resp.data.items[0]
      } else if (resp.data.countyMortgageCoverageSummary) {
        successfulQuery = true
        responseData = resp.data.countyMortgageCoverageSummary
      } else {
        propertyMissingRecords = true
        failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 200, ...resp.data}
      }
    }
  } else {
    if (failedQuery.Code === 400) {
      failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 400, Type: 'Bad Request'}
      brokenConnection = true
    } else if (failedQuery.Code === 401) {
      failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 401, Type: 'Unauthorized'}
      unauthorizedQuery = true
    } else if (failedQuery.Code === 403) {
      failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 403, Type: 'Forbidden'}
      brokenConnection = true
    } else if (failedQuery.Code === 404) {
      failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 404, Type: 'Not Found'}
      brokenConnection = true
    } else if (failedQuery.Code === 500) {
      failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 500, Type: 'Internal Server Error'}
    }
    failedQuery = {Vendor: 'CoreLogic', AddressAttempted: queryAddress, Code: 999, Type: 'Unknown'}
  }

  return {successfulQuery, responseData, propertyNotFound, propertyMissingRecords, brokenConnection, failedQuery, improperQuery, unauthorizedQuery}
}