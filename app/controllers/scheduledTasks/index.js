const moment = require('moment');
const CronTickerModel = require('../../models/cronTicker');
const cronTickerEvent = require('../../../cron-service/events/cron-ticker.event.cjs');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiSuccessResponse, sendApiErrorResponse } = require('../../utils/response.utils');

async function createCronTicker(req, res) {
  try {
    let newCronTicker = new CronTickerModel({
      name: 'Cron Ticker',
      value: 0,
    })
    await newCronTicker.save()

    let eventParams = {
      name: 'Cron Ticker',
      cycle: {
        unit: 'hours',
        value: 1,
      },
      action: {
        name: 'cron-ticker',
        params: {
          cronId: newCronTicker._id,
        },
      }
    }

    await cronTickerEvent(newCronTicker._id)

    let time = moment(new Date())
    let logTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Log', logTime, 'Cron Ticker Created', 'Scheduled Tasks', [{type: 'New Event Parameters', detail: eventParams}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {newLog}, 'Ticker created successfully!')
  } catch (error) {
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Create Cron Ticker Scheduled Task', [{}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { createCronTicker }