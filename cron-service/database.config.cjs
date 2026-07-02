require("dotenv").config();
const { default: mongoose } = require("mongoose");
const mongodb = mongoose.createConnection(process.env.DATABASE_URL);

const cronEventSchema = new mongoose.Schema({
  name: String,
  enabled: Boolean,
  cycle: {
    value: Number,
    unit: String,
  },
  executionCount: Number,
  nextExecution: Date,
  lastExecution: Date,
  createdAt: Date,
  action: {
    name: String,
    params: Object,
  },
  history: [
    {
      id: mongoose.Types.ObjectId,
      status: String,
      executedAt: Date,
      action: {
        name: String,
        params: Object,
      },
    },
  ],
});

const CronEventModel = mongodb.model("CronEvent", cronEventSchema);

module.exports = {
  CronEventModel,
};
