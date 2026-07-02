const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const incomingSignalSchema = new mongoose.Schema(
  {
    sender: {
      type: String
    },
    time: {
      type: String
    },
    content: {
      type: String
    },
  }
);

incomingSignalSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('IncomingSignal', incomingSignalSchema);
