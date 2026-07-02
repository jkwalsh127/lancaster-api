const trimRequest = require("trim-request");
const activeLeadsRouter = require("express").Router();
const addLeadTagController = require("../controllers/activeLeads/addLeadTag");
const dismissLeadController = require("../controllers/activeLeads/dismissLead");
const setStatusClosingController = require("../controllers/activeLeads/setStatusClosing");
const addLeadAssigneesController = require("../controllers/activeLeads/addLeadAssignees");
const { authenticationMiddleWare } = require("../middleware/auth");
const verifyPublicRecordsController = require("../controllers/activeLeads/verifyPublicRecords");
const changeTargetOutcomeController = require("../controllers/activeLeads/changeTargetOutcome");
const statusStatusFinalizedController = require("../controllers/activeLeads/setStatusFinalized");
const saveLeadTargetChangesController = require("../controllers/activeLeads/saveLeadTargetChanges");
const setStatusInvestigatingController = require("../controllers/activeLeads/setStatusInvestigating");

// activeLeadsRouter.use(authenticationMiddleWare);

activeLeadsRouter.patch(
	"/dismiss",
	trimRequest.all,
	dismissLeadController.dismissLead
);
activeLeadsRouter.patch(
	"/set/investigating",
	trimRequest.all,
	setStatusInvestigatingController.setStatusInvestigating
);
activeLeadsRouter.patch(
	"/set/closing",
	trimRequest.all,
	setStatusClosingController.setStatusClosing
);
activeLeadsRouter.post(
	"/set/finalized",
	trimRequest.all,
	statusStatusFinalizedController.setStatusFinalized
);
activeLeadsRouter.patch(
	"/addLeadTag",
	trimRequest.all,
	addLeadTagController.addLeadTag
);
activeLeadsRouter.patch(
	"/changeOutcome",
	trimRequest.all,
	changeTargetOutcomeController.changeTargetOutcome
);
activeLeadsRouter.patch(
	"/targets/save",
	trimRequest.all,
	saveLeadTargetChangesController.saveLeadTargetChanges
);
activeLeadsRouter.patch(
	"/verifyPublicRecords",
	trimRequest.all,
	verifyPublicRecordsController.verifyPublicRecords
);
activeLeadsRouter.patch(
	"/add/assignees",
	trimRequest.all,
	addLeadAssigneesController.addLeadAssignees
);

module.exports = activeLeadsRouter;