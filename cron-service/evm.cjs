const Bree = require("bree");
const Cabin = require("cabin");
const dayjs = require("dayjs");
const path = require("path");
const Fs = require("fs");
const { CronEventModel } = require("./database.config.cjs");

const bree = new Bree({
  logger: new Cabin(),
  root: false,
  jobs: [
    {
      name: "crawler",
      cron: "*/10 * * * *",
      path: path.join(__dirname, "cron.action.cjs"),
    },
  ],
});

module.exports = {
  async __init__() {
    await bree.start();
  },

  async createEvent(params) {
    const actionPath = path.resolve(
      __dirname,
      "./actions",
      `${params.action.name}.action.cjs`
    );
    if (!Fs.existsSync(actionPath)) {
      throw new Error(
        "Action to execute does not exist. Please check and try again"
      );
    }

    const event = await CronEventModel.create({
      name: params.name,
      cycle: params.cycle,
      action: params.action,
      enabled: true,
      executionCount: 0,
      lastExecution: null,
      nextExecution: getNearestTime(
        dayjs().add(params.cycle.value, params.cycle.unit).toISOString(),
        params.cycle
      ),
      createdAt: new Date(),
      history: [],
    });

    return event;
  },

  async getEvents() {
    const events = await CronEventModel.find();
    return events;
  },

  /**
   * Manually trigger the execution of an event from the cron schedule
   * @param params
   * @param params.cronEventId - The object id of the event to trigger.
   * */
  async triggerEvent(params) {
    const event = await CronEventModel.findById(params.cronEventId);
    if (!event) {
      throw new Error("This job does not exist. Please check and try again");
    }
    return await updateEventAfterAction(event);
  },

  async enableEvent(params) {
    const event = await CronEventModel.findById(params.cronEventId);
    if (!event) {
      throw new Error("This job does not exist. Please check and try again");
    }
    return await event.updateOne(
      {
        enabled: true,
        nextExecution: getNearestTime(
          dayjs().add(event.cycle.value, event.cycle.unit).toISOString(),
          event.cycle
        ),
      },
      { new: true }
    );
  },

  async disableEvent(params) {
    const event = await CronEventModel.findById(params.cronEventId);
    if (!event) {
      throw new Error("This job does not exist. Please check and try again");
    }
    return await event.updateOne(
      {
        enabled: false,
        nextExecution: null,
      },
      { new: true }
    );
  },
};

// __ HELPERS __

function getNearestTime(dateTime, cycle) {
  const date = new Date(dateTime);
  if (cycle.unit === "minutes") {
    let minutes = date.getMinutes();
    const minutesDistance = 10 - (minutes % 10);
    minutes += minutesDistance;
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  if (cycle.unit === "hours") {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  if (cycle.unit === "days") {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }
  return date;
}

async function updateEventAfterAction(event, isTrigger = false) {
  const lastExecution = event.nextExecution;
  let query = {
    lastExecution: lastExecution,
    nextExecution: getNearestTime(
      dayjs(lastExecution).add(event.cycle.value, event.cycle.unit),
      event.cycle
    ),
    executionCount: event.executionCount + 1,
    history: event.history,
  };

  if (isTrigger) {
    query = {
      executionCount: event.executionCount + 1,
      history: event.history,
    };
  }

  try {
    const action = require(`./actions/${event.action.name}.action.cjs`);
    await action(event.action.params);
    query.history.push({
      status: "successful",
      executedAt: query.lastExecution,
      action: event.action,
    });
    await event.updateOne(query);
    return event;
  } catch (error) {
    console.error(error)
    console.info('')
    query.history.push({
      status: "failed",
      executedAt: query.lastExecution,
      action: event.action,
      verbose: JSON.stringify(error),
    });
    await event.updateOne(query);
  }
}

module.exports.updateEventAfterAction = updateEventAfterAction;

// /**
//  * The scheduler client exposes an API to manage crontab schedules,
//  * on a mongodb database
//  * @param {Object} config - The scheduler configuration object
//  * @param {Connection} config.connection - A connection instance to a mongodb database
//  * @returns
//  *
//  */
// // TODO: Ensure only one task runner is running at a time.
// module.exports.createEventManager = async (config) => {
//   const CronEvent = CronEventModel(config.connection);
//   const bree = new Bree({
//     logger: new Cabin(),
//     root: false,
//   });
//   await bree.start();

//   bree.on("worker created", (name) => {
//     console.info("worker created", name);
//     console.info(brerse.workers.get(name));
//     console.info(bree.workers);
//   });

//   /**
//    * The createSchedule method creates a new crontab job
//    * and adds it the database.
//    *
//    * @param {Object} params - The DTO required to create a new schedule
//    * @param {string} params.name - The name of the schedule
//    * @param {string} params.cycle - The action to perform when due
//    * @param {function} params.action - The action to perform when due
//    * @returns
//    */
//   async function createEvent(params) {
//     let cronEvent = new CronEvent({
//       name: params.name,
//       enabled: true,
//       cycle: params.cycle,
//       executionCount: 0,
//       lastExecutionTime: null,
//       nextExecutionTime: null,
//     });
//     cronEvent = await cronEvent.save();

//     await bree.add({
//       name: cronEvent._id.toString(),
//       path: params.action,
//       interval: params.cycle,
//     });
//     await bree.start(cronEvent._id.toString());
//     console.info(bree.workers);
//     return cronEvent;
//   }

//   async function getEvents() {
//     // await bree;
//     const events = await CronEvent.find();
//     return events;
//   }

//   /**
//    * Manually trigger the execution of an event from the cron schedule
//    * @param params
//    * @param params.cronEventId - The object id of the event to trigger.
//    *
//    * */
//   async function triggerEvent(params) {
//     await bree.run(params.cronEventId);
//   }

//   /**
//    * Set event status to enabled and adds event to the cron schedule
//    * @param params
//    * @param params.cronEventId - The object id of the event to enable.
//    *
//    * */
//   async function enableEvent(params) {
//     // Do something
//     console.info(params);
//     await bree.start(params.cronEventId.toString());
//     const event = await CronEvent.findOneAndUpdate(
//       { _id: params.cronEventId },
//       { enabled: true },
//       { new: true }
//     );
//     return event;
//   }

//   /**
//    * Set event status to disable and removes event from the cron schedule
//    * @param params
//    * @param params.cronEventId - The object id of the event to enable.
//    * */
//   async function disableEvent(params) {
//     await bree.stop(params.cronEventId);
//     const event = await CronEvent.findOneAndUpdate(
//       { _id: params.cronEventId },
//       { enabled: false },
//       { new: true }
//     );
//     return event;
//   }

//   return { createEvent, getEvents, enableEvent, disableEvent };
// };
