const trimRequest = require("trim-request");
const emailRouter = require("express").Router();
const emailController = require("../controllers/emails");
const { authenticationMiddleWare } = require("../middleware/auth");

module.exports = emailRouter;