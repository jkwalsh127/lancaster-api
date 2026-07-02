const trimRequest = require("trim-request");
const authRouter = require("express").Router();
const authController = require("../controllers/auth");
const { authenticationMiddleWare } = require("../middleware/auth");

authRouter.get(
	"/testConnection",
	trimRequest.all,
	authController.testConnection
);
authRouter.patch(
	"/establishCredentials",
	trimRequest.all,
	authController.establishRequestCredentials
);
authRouter.patch(
	"/login/returning/user",
	trimRequest.all,
	authController.loginReturningUser
);
authRouter.patch(
	"/log/returning",
	trimRequest.all,
	authController.logReturningVisit
);
authRouter.post(
	"/create/guest",
	trimRequest.all,
	authController.createGuestAccount
);
authRouter.post(
	"/logout",
	trimRequest.all,
	authController.logoutUser
);
authRouter.post(
	"/login/select/email",
	trimRequest.all,
	authController.selectLoginByEmail
);

module.exports = authRouter;