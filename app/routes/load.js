const trimRequest = require("trim-request");
const loadRouter = require("express").Router();
const initialLoadController = require("../controllers/load/initialLoad");
const { authenticationMiddleWare } = require("../middleware/auth");

loadRouter.use(authenticationMiddleWare);

loadRouter.get(
	"/initial/:userId",
	trimRequest.all,
	initialLoadController.initialLoad
);

module.exports = loadRouter;