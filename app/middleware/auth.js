const jwt = require('jsonwebtoken');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../utils/response.utils');
const { decryptEncryption } = require('../utils/encryption.utils');
const User = require('../models/user');
const environment = require('../../config/environment');

exports.authenticationMiddleWare = async function (req, res, next) {
  try {
    let accessToken = decryptEncryption(req.headers.authorization);
    jwt.verify(accessToken, environment.JWT_SECRET, async function(err, decoded) {
      if (err) {
        console.info('-----------------------------------')
        console.info('-----------------------------------')
        console.info('*** No can do. Access denied. Web Token Expired')
        console.info('Details:')
        console.error(err)
        console.info('')
        sendApiSuccessResponse(res, null, 'Web Token Expired')
      } else {
        console.info('-----------------------------------')
        console.info('-----------------------------------')
        console.info(`*** Access token validated. I'm letting them in.`)
        console.info("*** Here's the receipts:")
        console.info(decoded)
        console.info('')
        const user = await User.findById(decoded._id);
        if (!user) throw new Error();
        req.user = user;
        next();
      }
    })
  } catch (error) {
    sendApiErrorResponse(res, 'Access to this resource has been denied. Sign in and try again.', 401)
  }
};