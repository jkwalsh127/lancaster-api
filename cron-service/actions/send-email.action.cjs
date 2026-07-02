var AWS = require("aws-sdk");
AWS.config.update({ region: "REGION" });

module.exports = async function (recipients = []) {
  // Create sendTemplatedEmail params
  var params = {
    Destination: {
      /* required */
      CcAddresses: [
        "EMAIL_ADDRESS",
        /* more CC email addresses */
      ],
      ToAddresses: [
        "EMAIL_ADDRESS",
        /* more To email addresses */
      ],
    },
    Source: "solutions@lancastersweep.com" /* required */,
    Template: "TEMPLATE_NAME" /* required */,
    TemplateData: '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }' /* required */,
    ReplyToAddresses: ["EMAIL_ADDRESS"],
    ReturnPath: ["feedback@example.com"],
    ReturnPathArn: ["arn:aws:ses:us-east-1:123456789012:identity/example.com"],
  };
  
  // Create the promise and SES service object
  var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendTemplatedEmail(params)
    .promise();
  
  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function (data) {
      console.info(data);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
};

