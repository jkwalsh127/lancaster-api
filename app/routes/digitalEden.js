const trimRequest = require("trim-request");
const activeLeadsRouter = require("express").Router();
const receiveTVSignalController = require("../controllers/digitalEden/receiveTVSignal");

// activeLeadsRouter.use(authenticationMiddleWare);

activeLeadsRouter.post(
  "/signals/receive/tradingView",
  trimRequest.all,
  receiveTVSignalController.receiveTVSignal
);

module.exports = activeLeadsRouter;