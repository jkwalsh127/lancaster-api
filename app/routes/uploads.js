const trimRequest = require("trim-request");
const uploadsRouter = require("express").Router();
const saveFromSearchController = require("../controllers/uploads/saveFromSearch");
const { authenticationMiddleWare } = require("../middleware/auth");
const recordUploadPerformanceController = require("../controllers/uploads/recordUploadPerformance");

// uploadsRouter.use(authenticationMiddleWare);

uploadsRouter.post(
	"/record",
	trimRequest.all,
	recordUploadPerformanceController.recordUploadPerformance
);
uploadsRouter.post(
	"/mortgages/search",
	trimRequest.all,
	saveFromSearchController.saveFromSearch
);

module.exports = uploadsRouter;