const axios = require('axios');
const moment = require('moment');
const UserModel = require('../../models/user')
const TeamModel = require('../../models/team')
const { IP_API_KEY } = require('../../../config/environment');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const TeamMonthlyStatsModel = require('../../models/teamMonthlyStats')
const PortfolioMonthlyStatsModel = require('../../models/portfolioMonthlyStats')
const { establishMonthlyStatSession } = require('../../utils/monthlyStats.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function testConnection(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** Someone is testing the connection...`)
    console.info('')
    sendApiSuccessResponse(res, null, 'Connection is live.');
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
  }
}

async function establishRequestCredentials(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** New session request.`)
    let logTime = moment(new Date()).format("MMM Do, YYYY HH:mm:ss")
    console.info(logTime)
    console.info('*** Establishing request credentials...')
    // let ipLocation = await axios.get(`https://pro.ip-api.com/json/${req.body.reqIP}?fields=status,regionName,city,isp,mobile,proxy&key=${IP_API_KEY}`)
    // console.info(ipLocation.data)

    if (logTime) {
    // if (ipLocation && ipLocation.data.status === 'success') {
      // let newMonth = moment(new Date()).month()
      // let monthlyStatSession = await establishMonthlyStatSession(newMonth, moment(new Date()))
      
      // let todaysDateISO = moment(new Date()).toISOString()
      // let sessionStr = todaysDateISO.substring(0,7)
      // let sessionStrToParse = moment(sessionStr)
      // let sessionParsed = Date.parse(sessionStrToParse)
      // console.log(sessionParsed)
      // let newMonthlyStat = null
      // let newPortfolioStat = null
      // let oldPortfolioStat = await PortfolioMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("sessionParsed")
      // let oldMonthlyStat = await TeamMonthlyStatsModel.findOne({sessionParsed: sessionParsed}).select("sessionParsed")
      // console.log(oldPortfolioStat)
      // if (!oldMonthlyStat || !oldPortfolioStat) {
      //   let team = await TeamModel.findOne().select('totalOriginalLoanAmount totalOriginalInterest totalAssessedPropertyValue totalPrincipalRemaining totalInterestRemaining mortgages')
      //   if (!oldMonthlyStat && team) {
      //     let monthlyStat = new TeamMonthlyStatsModel({
      //       belongsToTeam: team._id,
      //       sessionParsed: sessionParsed,
      //       sessionStr: sessionStr,
      //       sessionLabel: sessionLabel,
      //       sessionLabelFull: sessionLabelFull,
      //       monthNo: newMonth,
      //       quarter: monthlyStatSession.quarter,
      //       quarterSession: monthlyStatSession.quarterSession,
      //       totalQueried: 0,
      //       successfulQueries: 0,
      //       failedQueries: 0,
      //       totalNewLeads: 0,
      //       totalHits: 0,
      //       totalHitsPercent: 0,
      //       tier1New: 0,
      //       totalDiscrepancies: 0,
      //       closedRefinances: 0,
      //       closedRenegotiations: 0,
      //       grossProfitNumber: 0,
      //       grossProfitPercent: 0,
      //       teamGrossProfitNumber: 0,
      //       teamGrossProfitPercent: 0,
      //       leadsDismissed: 0,
      //     })
      //     await monthlyStat.save()
      //     newMonthlyStat = await TeamMonthlyStatsModel.findById(monthlyStat._id)
      //   }
      //   if (!oldPortfolioStat && team) {
      //     console.log('here')
      //     let portfolioStat = new PortfolioMonthlyStatsModel({
      //       belongsToTeam: team._id,
      //       sessionParsed: sessionParsed,
      //       sessionStr: sessionStr,
      //       sessionLabel: monthlyStatSession.sessionLabel,
      //       sessionLabelFull: moment(new Date()).format('MMM YYYY'),
      //       monthNo: newMonth,
      //       quarter: monthlyStatSession.quarter,
      //       quarterSession: monthlyStatSession.quarterSession,
      //       numberOfMortgages: team.mortgages.length,
      //       totalOriginalLoanAmount: team.totalOriginalLoanAmount,
      //       totalOriginalInterest: team.totalOriginalInterest,
      //       totalAssessedPropertyValue: team.totalAssessedPropertyValue,
      //       totalPrincipalRemaining: team.totalPrincipalRemaining,
      //       totalInterestRemaining: team.totalInterestRemaining,
      //       totalPaymentsReceived: 0,
      //       totalInterestReceived: 0,
      //       totalEarlyPayments: 0,
      //     })
      //     await portfolioStat.save()
      //     newPortfolioStat = await PortfolioMonthlyStatsModel.findById(portfolioStat._id)
      //   }
      //   if (!oldPortfolioStat && !oldMonthlyStat) {
      //     await team.updateOne({
      //       $push: {
      //         teamMonthlyStats: {
      //           $each: [ newMonthlyStat._id ],
      //           $position: 0
      //         },
      //         portfolioMonthlyStats: {
      //           $each: [ newPortfolioStat._id ],
      //           $position: 0
      //         },
      //       }
      //     })
      //   } else if (!oldPortfolioStat) {
      //     await team.updateOne({
      //       $push: {
      //         portfolioMonthlyStats: {
      //           $each: [ newPortfolioStat._id ],
      //           $position: 0
      //         },
      //       }
      //     })
      //   } else {
      //     await team.updateOne({
      //       $push: {
      //         teamMonthlyStats: {
      //           $each: [ newMonthlyStat._id ],
      //           $position: 0
      //         },
      //       }
      //     })
      //   }
      // }

      // let reqCredentials = {
      //   reqIP: req.body.reqIP,
      //   reqLocation: ipLocation.data.city + ', ' + ipLocation.data.regionName,
      //   reqISP: ipLocation.data.isp,
      //   reqMobile: ipLocation.data.mobile,
      //   reqProxy: ipLocation.data.proxy,
      // }
      let reqCredentials = {}
      let userHistory = ''
  
      let users = await UserModel.find({ validatedIPs: reqCredentials.reqIP }).select('firstName email')
      if (users.length > 1) {
        userHistory = 'multipleUsers'
      } else if (users.length === 1) {
        userHistory = 'existing'
      } else {
        userHistory = 'N/A'
      }
  
      let existingTeam = true
      let team = await TeamModel.findOne().select('_id')
      if (!team) {
        existingTeam = false
      }
  
      await handleRequestLog('Log', logTime, 'Establish Request Credentials', 'Auth', [{}], 'success', false, null, reqCredentials.reqIP, reqCredentials.reqLocation, reqCredentials.reqISP, reqCredentials.reqProxy, reqCredentials.reqMobile)
      sendApiSuccessResponse(res, { userHistory, existingTeam, reqCredentials }, 'Request credentials established successfully.');
      console.info(`*** User History: ${userHistory}`)
      console.info("*** Success")
      console.info('')
    } else {
      let errorTime = moment(new Date()).format("MMM Do, YYYY HH:mm:ss")
      await handleRequestLog('Error', errorTime, 'API Request Error', 'Establish Request Credentials', [{}], error, true, null, req.body.reqIP)
      sendApiSuccessResponse(res, null, 'Failed to establish credentials.');
      console.info('*** Failed to establish request credentials!! The error:')
      // console.error(ipLocation)
      console.info('')
    }
  } catch (error) {
    try {
      console.info('*** Something went wrong!! The error:')
      console.error(error)
      console.info('Attempting to establish req credentials...')
      console.info('')
      // let ipLocation = await axios.get(`https://pro.ip-api.com/json/${req.body.reqIP}?fields=status,city,isp,mobile,proxy&key=${IP_API_KEY}`)
      // let reqLocation = ipLocation.data.city + ', ' + ipLocation.data.regionName
      let time = moment(new Date())
      let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
      // await handleRequestLog('Error', errorTime, 'API Request Error', 'Establish Request Credentials', [{}], error, true, null, req.body.reqIP, reqLocation, ipLocation.data.isp, ipLocation.data.mobile, ipLocation.data.proxy, ipLocation.data.mobile)
      sendApiErrorResponse(res, {}, error)
    } catch (error) {
      console.info('*** Failed to establish request credentials!! The error:')
      console.error(error)
      console.info('')
      let time = moment(new Date())
      let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
      await handleRequestLog('Error', errorTime, 'API Request Error', 'Establish Request Credentials', [{}], error, true, null, req.body.reqIP)
      sendApiErrorResponse(res, {}, error)
    }
  }
}

async function createGuestAccount(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Creating guest account. Request body:')
    console.info(req.body)
    let time = moment(new Date())
    let todaysDateLabel = time.format("MMM Do, YYYY") 
    let firstName = req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1)
    let lastName = req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1)
    let team = await TeamModel.findOne()
    let newGuest = {}
    if (!team) {
      sendApiSuccessResponse(res, null, 'Launch required')
      console.info('*** The app has not been launched. Whoops...')
      console.info('')
    } else {
      let registeredUser = await UserModel.findOne({email: req.body.email.toLowerCase()})
      if (registeredUser) {
        sendApiSuccessResponse(res, null, 'Email registered')
        console.info('*** New user IP has been added to existing account (no new registration).')
        console.info('')
      } else {
        let initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase()
        newGuest = new UserModel({
          dateCreated: todaysDateLabel,
          role: 'guest',
          firstName: firstName,
          lastName: lastName,
          fullName: firstName + ' ' + lastName,
          email: req.body.email.toLowerCase(),
          team: team._id,
          initials: initials,
          validatedIPs: [req.body.reqIP],
          ipsAndLocations: [{
            ip: req.body.reqIP,
            isp: req.body.reqISP,
            location: req.body.reqLocation,
            proxy: req.body.reqProxy,
            mobile: req.body.reqMobile,
            userAgent: req.body.reqUserAgent,
            userAgentData: req.body.reqUserAgentData,
          }],
        })
        await newGuest.save()
    
        await team.updateOne({
          $push: { guests: newGuest._id }
        })
        let newUser = await newGuest.getPublicUserData()
        let logTime = time.format("MMM Do, YYYY HH:mm:ss")
        await handleRequestLog('Log', logTime, 'Guest Account Created', 'Auth', [{}], 'success', false, newUser.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
        sendApiSuccessResponse(res, { guest: newUser, accessToken: newGuest.createAccessToken() }, 'Guest Account Created')
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
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Guest Account Created', [{}], error, true, null, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
    sendApiErrorResponse(res, {}, error)
  }
}

async function loginReturningUser(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Handling access for existing user. Request body:')
    console.info(req.body)
    let time = moment(new Date())

    if (req.body.accessToken !== process.env.ACCESS && req.body.accessToken !== process.env.REGISTRATION && req.body.accessToken !== process.env.ELEVATEDACCESS) {
      sendApiSuccessResponse(res, null, 'Invalid access token.')
      console.info('*** Hold up. The access token provided is invalid. Denying access to the app...')
      console.info('')
    } else {
      if (req.body.accessToken === process.env.REGISTRATION) {
        let user = await UserModel.findOne(({role: 'super'}))
        let userInfo = {
          role: user.role[0],
          email: user.email,
          firstName: user.firstName,
          fullName: user.fullName,
          initials: user.initials,
          teamId: user.team,
          protocol: req.body.reqIP,
          location: req.body.reqLocation,
          isp: req.body.reqISP,
          proxy: req.body.reqProxy,
          mobile: req.body.reqMobile,
          userId: user._id.toString()
        }
        let logTime = time.format("MMM Do, YYYY HH:mm:ss")
        await handleRequestLog('Log', logTime, 'Super User Login', 'Auth', [{}], 'success', false, user.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
        sendApiSuccessResponse(res, { userId: user._id, accessToken: user.createAccessToken(), userInfo }, 'Super Login successful!')
        console.info("*** Super Login Success")
        console.info('')
      } else if (req.body.accessToken === process.env.ELEVATEDACCESS) {
        let user = await UserModel.findOne(({role: 'admin'}))
        if (user) {
          let userInfo = {
            role: user.role[0],
            email: user.email,
            firstName: user.firstName,
            fullName: user.fullName,
            initials: user.initials,
            teamId: user.team,
            protocol: req.body.reqIP,
            location: req.body.reqLocation,
            isp: req.body.reqISP,
            proxy: req.body.reqProxy,
            mobile: req.body.reqMobile,
            userId: user._id.toString()
          }
          let logTime = time.format("MMM Do, YYYY HH:mm:ss")
          await handleRequestLog('Log', logTime, 'Admin Login', 'Auth', [{}], 'success', false, user.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
          sendApiSuccessResponse(res, { userId: user._id, accessToken: user.createAccessToken(), userInfo }, 'Login successful!')
          console.info("*** Success")
          console.info('')
        } else {
          sendApiSuccessResponse(res, null, 'No user found.')
          console.info('*** Hmmm, no user was found with that email...')
          console.info('')
        }
      } else {
        let user = await UserModel.findOne(({role: 'user'}))
        if (user) {
          let userInfo = {
            role: user.role[0],
            email: user.email,
            firstName: user.firstName,
            fullName: user.fullName,
            initials: user.initials,
            teamId: user.team,
            protocol: req.body.reqIP,
            location: req.body.reqLocation,
            isp: req.body.reqISP,
            proxy: req.body.reqProxy,
            mobile: req.body.reqMobile,
            userId: user._id.toString()
          }
          let logTime = time.format("MMM Do, YYYY HH:mm:ss")
          await handleRequestLog('Log', logTime, 'User Login', 'Auth', [{}], 'success', false, user.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
          sendApiSuccessResponse(res, { userId: user._id, accessToken: user.createAccessToken(), userInfo }, 'Login successful!')
          console.info("*** Success")
          console.info('')
        } else {
          sendApiSuccessResponse(res, null, 'No user found.')
          console.info('*** Hmmm, no user was found with that email...')
          console.info('')
        }
      }
    }
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'User Login', [{}], error, true, null, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
    sendApiErrorResponse(res, {}, error)
  }
}

async function selectLoginByEmail(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** User is selecting their login email:`)
    console.info(req.body.email)
    let user = await UserModel.findOne(({email: req.body.email}))
    if (user) {
      let matchingUser = user.validatedIPs.find(ip => ip === req.body.reqIP)
      if (matchingUser) {
        let logTime = time.format("MMM Do, YYYY HH:mm:ss")
        await handleRequestLog('Log', logTime, 'Login by Email', 'Auth', [{}], 'success', false, user.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
        sendApiSuccessResponse(res, { userId: user._id, accessToken: user.createAccessToken() }, 'Login successful!')
        console.info("*** Success")
        console.info('')
      } else {
        sendApiSuccessResponse(res, null, 'No user.')
        console.info('*** No user found.')
        console.info('')
      }
    } else {
      sendApiSuccessResponse(res, null, 'No user.')
      console.info('*** No user found.')
      console.info('')
    }
  } catch (error) {
    console.info('*** Failed to sign in user!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Select Login by Email', [{}], error, true, null, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobileP)
    sendApiErrorResponse(res, {}, error)
  }
}

async function logReturningVisit(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Recording log for returning user. Request body:')
    console.info(req.body)
    console.info('*** User Agent Data:')
    console.info(req.body.reqUserAgentData)
    let time = moment(new Date())
    let todaysDateLabel = time.format("MMM Do, YYYY") 
    let reqIP = req.body.reqIP
    let reqLocation = req.body.reqLocation
    let reqISP = req.body.reqISP
    let reqProxy = req.body.reqProxy
    let reqMobile = req.body.reqMobile
    let loginEntry = {
      date: todaysDateLabel,
      ip: reqIP,
    }
    let existingUser = await UserModel.findByIdAndUpdate((req.body.userId), {
      $push: { loginDates: {
          $each: [loginEntry],
          $position: 0,
        } 
      }
    })
    let user = {}
    if (existingUser) {
      let matchingIP = existingUser.validatedIPs.find(ip => ip === reqIP)
      if (!matchingIP) {
        await existingUser.updateOne({
          $push: {
            validatedIPs: reqIP,
            ipsAndLocations: {
              ip: reqIP,
              isp: reqISP,
              location: reqLocation,
              proxy: reqProxy,
              mobile: reqMobile,
              userAgent: req.body.reqUserAgent,
              userAgentData: req.body.reqUserAgentData,
            }
          }
        })
      }
      user = await existingUser.getPublicUserData()
      let logTime = time.format("MMM Do, YYYY HH:mm:ss")
      let newLog = await handleRequestLog('Log', logTime, 'Returning User', 'Auth', [{}], 'success', false, null, reqIP, reqLocation, reqISP, reqProxy)
      sendApiSuccessResponse(res, {user, newLog}, 'Request credentials established.');
      console.info("*** Success")
      console.info('')
    } else {
      let logTime = time.format("MMM Do, YYYY HH:mm:ss")
      await handleRequestLog('Log', logTime, 'Returning User Failed', 'Auth', [{}], 'success', false, null, reqIP, reqLocation, reqISP, reqProxy)
      sendApiSuccessResponse(res, null, 'Failed.');
      console.info('*** Hmmmm, no user was found. Front end should clear local storage and refresh the browser.')
      console.info('')
    }
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Returning User', [{}], error, true, null, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy)
    sendApiErrorResponse(res, {}, error)
  }
}

async function logoutUser(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Logging out user. Request body:')
    console.info(req.body)
    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Log', logTime, 'User Logout', 'Auth', [{}], 'success', false, req.body.oldSesssion.fullName, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
    sendApiSuccessResponse(res, {}, 'Logout successful!');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'User Logout', [{}], error, true, null, req.body.reqIP, req.body.reqLocation, req.body.reqISP, req.body.reqProxy, req.body.reqMobile)
    sendApiErrorResponse(res, null, error)
  }
}

module.exports = { establishRequestCredentials, logReturningVisit, createGuestAccount, loginReturningUser, logoutUser, testConnection, selectLoginByEmail };
