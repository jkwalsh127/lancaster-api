const trimRequest = require("trim-request");
const queriesRouter = require("express").Router();
const runSweepController = require("../controllers/queries/runSweep");
const propertySearchForUploadController = require("../controllers/queries/propertySearchForUpload");
const propertySearchController = require("../controllers/queries/propertySearch");
const { authenticationMiddleWare } = require("../middleware/auth");
const recordSweepPerformanceController = require("../controllers/queries/recordSweepPerformance");

queriesRouter.post(
	"/property/search",
	trimRequest.all,
	propertySearchController.propertySearch
);
queriesRouter.post(
	"/property/search/upload",
	trimRequest.all,
	propertySearchForUploadController.propertySearchForUpload
);
queriesRouter.post(
	"/recordSweep/query",
	trimRequest.all,
	runSweepController.runSweep
);
queriesRouter.post(
	"/recordSweep/record",
	trimRequest.all,
	recordSweepPerformanceController.recordSweepPerformance
);

module.exports = queriesRouter;