const trimRequest = require("trim-request");
const teamRouter = require("express").Router();
const teamController = require("../controllers/team");
const { authenticationMiddleWare } = require("../middleware/auth");

// reportRouter.use(authenticationMiddleWare);

teamRouter.patch(
	"/update/security",
	trimRequest.all,
	teamController.updateSecuritySetting
);
teamRouter.patch(
	"/settings/defaultTargets",
	trimRequest.all,
	teamController.updateDefaultTargets
);
teamRouter.patch(
	"/parameter/activeStatus",
	trimRequest.all,
	teamController.updateParameterActiveStatus
);
teamRouter.patch(
	"/parameter/settings",
	trimRequest.all,
	teamController.updateParameterSettings
);
teamRouter.delete(
	"/actionAndErrorLog/delete",
	trimRequest.all,
	teamController.deleteActionOrErrorLog
);

module.exports = teamRouter;