const userRouter = require("express").Router();
const trimRequest = require("trim-request");
const userController = require("../controllers/user");
const { authenticationMiddleWare } = require("../middleware/auth");
const updateUserDefaultStateController = require("../controllers/user/updateUserDefaultLocations");

// reportRouter.use(authenticationMiddleWare);

userRouter.patch(
  "/removeNotification/report",
  trimRequest.all,
  userController.removeReportNotification
);
userRouter.patch(
  "/removeNotification/lead",
  trimRequest.all,
  userController.removeLeadNotification
);
userRouter.patch(
  "/removeNotification/newAssignment",
  trimRequest.all,
  userController.removeNewAssignmentNotification
);
userRouter.delete(
  "/deleteUser",
  trimRequest.all,
  userController.deleteUser
);
userRouter.patch(
  "/selectRolePermissions",
  trimRequest.all,
  userController.selectRolePermissions
);
userRouter.patch(
	"/settings/defaultLocations",
	trimRequest.all,
	updateUserDefaultStateController.updateUserDefaultLocations
);

module.exports = userRouter;