const { default: mongoose } = require("mongoose");
const CronTickerModel = require("../../app/models/cronTicker");
const { handleRequestLog } = require("../../app/utils/logHandling.utils");

module.exports = async function (params) {
  let connection = mongoose.createConnection(process.env.DATABASE_URL)

  connection.on('connected', async () => {
    if (params.cronId) {
      await CronTickerModel.findByIdAndUpdate((params.cronId.toString()), {
        $inc: { value: 1 }
      })
    } else {
      await handleRequestLog('Error', errorTime, 'Cron Ticker Action Error', 'cronId not provided', [{}], error, true, 'Cron Ticker Scheduled Task')
    }
    connection.close()
  })
  connection.on('disconnected', () => {
    console.info('connection disconnected')
  })
}