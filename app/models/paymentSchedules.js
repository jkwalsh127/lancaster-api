const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const paymentSchedulesSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String
    },
    apiMapping: {
      type: String
    },
    calculation: {
      type: String
    },
    legend: [{
      type: String
    }],
  }
);

paymentSchedulesSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('PaymentSchedules', paymentSchedulesSchema);
