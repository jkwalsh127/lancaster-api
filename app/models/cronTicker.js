const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const cronTickerSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    value: {
      type: Number,
      default: 0,
    }
  }
);

cronTickerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('CronTicker', cronTickerSchema);
