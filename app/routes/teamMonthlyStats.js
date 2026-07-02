const trimRequest = require("trim-request");
const teamMonthlyStatsRouter = require("express").Router();
const monthlyStatsController = require("../controllers/teamMonthlyStats");
const reloadPortfolioMonthlyStatsConroller = require("../controllers/teamMonthlyStats/reloadPortfolioMonthlyStats");
const fetchAllPortfolioMonthlyStatsController = require("../controllers/teamMonthlyStats/fetchAllPortfolioMonthlyStats");
const { authenticationMiddleWare } = require("../middleware/auth");

// teamMonthlyStatsRouter.use(authenticationMiddleWare);

teamMonthlyStatsRouter.post(
	"/team/quarterBreakdown/leadGeneration/reload",
	trimRequest.all,
	monthlyStatsController.reloadLeadGenerationsQuarterBreakdown
);
teamMonthlyStatsRouter.post(
	"/team/quarterBreakdown/renegotiation/reload",
	trimRequest.all,
	monthlyStatsController.reloadRenegotiationsQuarterBreakdown
);
teamMonthlyStatsRouter.post(
	"/team/quarterBreakdown/refinance/reload",
	trimRequest.all,
	monthlyStatsController.reloadRefinancesQuarterBreakdown
);
teamMonthlyStatsRouter.post(
	"/portfolioStats/reload",
	trimRequest.all,
	reloadPortfolioMonthlyStatsConroller.reloadPortfolioMonthlyStats
);
teamMonthlyStatsRouter.post(
	"/portfolioStats/fetch/all",
	trimRequest.all,
	fetchAllPortfolioMonthlyStatsController.fetchAllPortfolioMonthlyStats
);

module.exports = teamMonthlyStatsRouter;