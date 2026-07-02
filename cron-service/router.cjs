const evm = require("./evm.cjs");
const CronRouter = require("express").Router();

CronRouter.get("/list-events", async (req, res) => {
  res.json(await evm.getEvents());
});

CronRouter.post("/trigger-event", async (req, res) => {
  try {
    const event_id = req.body.event_id;
    console.info(req.body);

    if (!event_id) {
      res.status(400).json({
        message: "Missing value of event id in request body",
      });
      return;
    }
    const event = await evm.triggerEvent({ cronEventId: event_id });
    res.json(event);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

CronRouter.post("/disable-event", async (req, res) => {
  try {
    const event_id = req.query.event_id;

    if (!event_id) {
      res.status(400).json({
        message: "Missing value of event id in request body",
      });
      return;
    }
    const event = evm.disableEvent({ cronEventId: event_id });
    res.json(event);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

CronRouter.post("/enable-event", async (req, res) => {
  try {
    const event_id = req.query.event_id;

    if (!event_id) {
      res.status(400).json({
        message: "Missing value of event id in request body",
      });
      return;
    }

    const event = evm.enableEvent({ cronEventId: event_id });
    res.json(event);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = CronRouter;
