const trimRequest = require("trim-request");
const tagViewsRouter = require("express").Router();
const reloadTagViewsController = require("../controllers/tagViews/reloadTagViews");
const { authenticationMiddleWare } = require("../middleware/auth");

// scheduledTasksRouter.use(authenticationMiddleWare);

tagViewsRouter.post(
	"/reload",
	trimRequest.all,
	reloadTagViewsController.reloadTagViews
);

module.exports = tagViewsRouter;