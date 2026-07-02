const { parentPort } = require("worker_threads");
const { CronEventModel } = require("./database.config.cjs");
const { updateEventAfterAction } = require("./evm.cjs");

async function db_scanner() {
  const dueEvents = await CronEventModel.find({
    enabled: true,
    nextExecution: { $lte: new Date() },
  });

  for (let event of dueEvents) {
    await updateEventAfterAction(event);
  }

  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
}

db_scanner();
