const trimRequest = require("trim-request");
const scheduledTasksRouter = require("express").Router();
const scheduledTasksController = require("../controllers/scheduledTasks");
const { authenticationMiddleWare } = require("../middleware/auth");

// scheduledTasksRouter.use(authenticationMiddleWare);

scheduledTasksRouter.post(
	"/cronTicker/create",
	trimRequest.all,
	scheduledTasksController.createCronTicker
);

module.exports = scheduledTasksRouter;