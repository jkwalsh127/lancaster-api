const ActionAndErrorLog = require('../models/actionAndErrorLog');

exports.handleRequestLog = async function (type, time, subject, location, details, result, sendEmail, userFullName, reqIP, reqLocation, reqISP, reqProxy, reqMobile) {
  let newLog = new ActionAndErrorLog({
    type: type,
    time: time,
    subject: subject,
    location: location,
    details: details,
    message: typeof result === 'string' ? result : result.message,
    user: userFullName,
    reqIP: reqIP,
    reqLocation: reqLocation,
    reqISP: reqISP,
    reqProxy: reqProxy,
    reqMobile: reqMobile,
  })
  await newLog.save()

  if (sendEmail) {

  }

  return newLog;
};