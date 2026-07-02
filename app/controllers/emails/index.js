var AWS = require("aws-sdk");
const moment = require('moment');
const { sendApiErrorResponse, sendApiSuccessResponse } = require("../../utils/response.utils");
AWS.config.update({ region: "us-west-2" });

async function sweepResultsEmail(req, res) {
  try {
    var params = {
      Destination: {
        CcAddresses: [],
        ToAddresses: [
          "jkwalsh127@gmail.com",
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "HTML_FORMAT_BODY",
          },
          Text: {
            Charset: "UTF-8",
            Data: "Hello!",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Test email",
        },
      },
      Source: "alerts@lancastersweep.com",
      ReplyToAddresses: [],
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
      .sendEmail(params)
      .promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function (data) {
        console.info(data)
        console.info(data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });

    sendApiSuccessResponse(res, null, 'email sent successfully!');
  } catch (error) {
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    // let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Update Status', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { sweepResultsEmail };