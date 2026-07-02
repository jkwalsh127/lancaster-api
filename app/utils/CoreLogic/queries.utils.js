const axios = require('axios');
const { CORE_LOGIC_KEY, CORE_LOGIC_SECRET } = require('../../../config/environment');

exports.requestCLAccessToken = async function () {
  let failedQuery = {}
  let oAuthFailed = false
  const resp = await axios.post('https://api-prod.corelogic.com/oauth/token','', {
    params: {
      'grant_type': 'client_credentials'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: CORE_LOGIC_KEY,
      password: CORE_LOGIC_SECRET,
    }
  })
  .catch(function (error) {
    if (error.response) {
      console.error(error)
      console.info('')
      //* The request was made and the server responded with a status code that falls out of the range of 2xx
      oAuthFailed = true
      failedQuery = {
        Vendor: 'CoreLogic',
        Code: error.response.status,
        Type: error.response.statusText,
        data: error.response.config.data,
        AddressAttempted: 'https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials',
        headers: error.response.headers,
        url: error.response.config.url,
        Message: 'Oauth failed',
      }
    } else if (error.request) {
      //* The request was made but no response was received. `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
      failedQuery = error.request
    } else {
      //* Something happened in setting up the request that triggered an Error
      failedQuery = {error: error.message}
    }
  })

  let authString = ''
  if (resp) {
    if (resp.data.access_token.length === 0) {
      oAuthFailed = true
      failedQuery = {
        Vendor: 'CoreLogic',
        Code: resp.status,
        Type: resp.statusText,
        data: resp.data,
        AddressAttempted: 'https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials',
        headers: resp.headers,
        url: resp.config.url,
        Message: 'Oauth Failed'
      }
    } else {
      authString = resp.data.access_token
    }
  }

  return {authString, oAuthFailed, failedQuery}
};