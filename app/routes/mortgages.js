const trimRequest = require("trim-request");
const editMortgage = require("../controllers/mortgage/edit");
const mortgageRouter = require("express").Router();
const editOneController = require("../controllers/mortgage/updateRecords/editOne");
const undoOneController = require("../controllers/mortgage/updateRecords/undoOne");
const resolveOneController = require("../controllers/mortgage/updateRecords/resolveOne");
const resolveAllDiscrepanciesController = require("../controllers/mortgage/updateRecords/resolveAllDiscrepancies");
const addMortgageNoteController = require("../controllers/mortgage/addMortgageNote");
const provideFinancialInformation = require("../controllers/mortgage/provideFinancialInformation");
const { authenticationMiddleWare } = require("../middleware/auth");
const updateMortgageAssigneesController = require("../controllers/mortgage/updateMortgageAssignees");
const addPrincipalPaymentController = require("../controllers/mortgage/addPrincipalPayment");
const updateMortgageTagsController = require("../controllers/mortgage/updateMortgageTags");
const checkForDuplicatesController = require("../controllers/mortgage/checkForDuplicates");
const deleteMortgageController = require("../controllers/mortgage/deleteMortgage");
const publicRecordAndCurrentController = require("../controllers/mortgage/deleteRecordDetails/publicRecordAndCurrent");

// mortgageRouter.use(authenticationMiddleWare);

mortgageRouter.post(
	"/notes/add",
	trimRequest.all,
	addMortgageNoteController.addMortgageNote
);
mortgageRouter.patch(
	"/update/edit/one",
	trimRequest.all,
	editOneController.editOne
);
mortgageRouter.patch(
	"/update/undo/one",
	trimRequest.all,
	undoOneController.undoOne
);
mortgageRouter.patch(
	"/update/resolve/one",
	trimRequest.all,
	resolveOneController.resolveOne
);
mortgageRouter.patch(
	"/update/resolve/all",
	trimRequest.all,
	resolveAllDiscrepanciesController.resolveAllDiscrepancies
);
mortgageRouter.post(
	"/duplicates",
	trimRequest.all,
	checkForDuplicatesController.checkForDuplicates
);
mortgageRouter.delete(
	"/delete",
	trimRequest.all,
	deleteMortgageController.deleteMortgage
);
mortgageRouter.patch(
	"/tags/add",
	trimRequest.all,
	updateMortgageTagsController.updateMortgageTags
);
mortgageRouter.patch(
	"/provide/financials",
	trimRequest.all,
	provideFinancialInformation.provideFinancialInformation
);
mortgageRouter.patch(
	"/delete/publicRecordDetails",
	trimRequest.all,
	publicRecordAndCurrentController.publicRecordAndCurrent
);
mortgageRouter.patch(
	"/add/assignees",
	trimRequest.all,
	updateMortgageAssigneesController.updateMortgageAssignees
);
mortgageRouter.patch(
	"/edit",
	trimRequest.all,
	editMortgage.edit
);
mortgageRouter.patch(
	"/payments/principalOnly",
	trimRequest.all,
	addPrincipalPaymentController.addPrincipalPayment
);

module.exports = mortgageRouter;