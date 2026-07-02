const trimRequest = require("trim-request");
const launchRouter = require("express").Router();
const launchController = require("../controllers/launch/enterprise");
const launchSandboxController = require("../controllers/launch/sandbox");
const launchExecutiveController = require("../controllers/launch/executive");
const { authenticationMiddleWare } = require("../middleware/auth");

launchRouter.post(
	"/team",
	trimRequest.all,
	launchController.launchEnterpriseTeam
);
launchRouter.post(
	"/executive",
	trimRequest.all,
	launchExecutiveController.launchExecutiveTeam
);
launchRouter.post(
	"/sandbox",
	trimRequest.all,
	launchSandboxController.launchSandbox
);

module.exports = launchRouter;