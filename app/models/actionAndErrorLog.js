const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const actionAndErrorLogSchema = new mongoose.Schema(
  {
    type: {
      type: String
    },
    time: {
      type: String
    },
    subject: {
      type: String
    },
    user: {
      type: String
    },
    location: {
      type: String
    },
    details: [{
      type: Object
    }],
    message: {
      type: String
    },
    reqIP: {
      type: String
    },
    reqLocation: {
      type: String
    },
    reqISP: {
      type: String
    },
    reqProxy: {
      type: Boolean
    },
  }
);

actionAndErrorLogSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('ActionAndErrorLog', actionAndErrorLogSchema);
