const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const NotificationScheduleSchema = new mongoose.Schema(
  {
    label: {
      type: String
    },
    type: {
      type: String
    },
    active: {
      type: Boolean
    },
  }
);

NotificationScheduleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('NotificationSchedule', NotificationScheduleSchema);
