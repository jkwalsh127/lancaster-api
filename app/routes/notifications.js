const trimRequest = require("trim-request");
const notificationRouter = require("express").Router();
const { authenticationMiddleWare } = require("../middleware/auth");

// notificationRouter.use(authenticationMiddleWare);


module.exports = notificationRouter;