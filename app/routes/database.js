const trimRequest = require("trim-request");
const databaseRouter = require("express").Router();
const dropAllController = require("../controllers/database/dropAll");
const { authenticationMiddleWare } = require("../middleware/auth");

databaseRouter.delete(
	"/drop/all",
	trimRequest.all,
	dropAllController.dropAll
);

module.exports = databaseRouter;