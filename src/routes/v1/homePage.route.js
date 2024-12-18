// module.exports = router;
const express = require('express');
const multer = require('multer');
const { validateApiRequest, trackApiUsage } = require('../../middlewares');
const upload = multer({ storage: multer.memoryStorage() });

const { MatchController, SeriesController, NewsController, VenueController, PlayerController, TeamController, IPLController } = require('../../controllers');

const router = express.Router();

// Match-related routes
router.route('/homeList').get(validateApiRequest(), trackApiUsage, trackApiUsage, MatchController.getHomeLists);
router.route('/matchInfo').post(validateApiRequest(), trackApiUsage, trackApiUsage, upload.any(), MatchController.getMatchInfo);
router.route('/matchBallByBall').post(validateApiRequest(), trackApiUsage, trackApiUsage, upload.any(), MatchController.getMatchBallByBallOddHistory);
router.route('/matchOddHistoryV1').post(validateApiRequest(), trackApiUsage, trackApiUsage, upload.any(), MatchController.getMatchBallByBallOddHistory);
// router.route('/commentary').post(upload.any(), MatchController.getBallByBallLiveMatch);
router.route('/liveMatch').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getliveMatch);
router.route('/commentary').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getMatchCommentary);
router.route('/manOfTheMatch').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getManOfTheMatch);
router.route('/scorecardByMatchId').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getScorecardByMatchId);
router.route('/squadsByMatchId').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getSquadsByMatchId);
router.route('/upcomingMatches').get(validateApiRequest(), trackApiUsage, MatchController.getUpcomingMatches);
router.route('/liveMatchList').get(validateApiRequest(), trackApiUsage, MatchController.getLiveMatchList);
router.route('/matchLiveBulkInfo').post(validateApiRequest(), trackApiUsage, MatchController.getMatchLiveBulkInfo);

// Series-related routes
router.route('/seriesList').get(validateApiRequest(), trackApiUsage, SeriesController.getSeriesLists);
router.route('/seriesDetails/:id').get(validateApiRequest(), trackApiUsage, SeriesController.getBySeriesId);
router.route('/upcomingMatchesBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getUpcomingMatchesBySeriesId);
router.route('/recentMatchesBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), MatchController.getRecentMatchesBySeriesId);
router.route('/squadsBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), SeriesController.getSquadsBySeriesId);
router.route('/seriesStatsBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), SeriesController.getStatsBySeriesId);
router.route('/pointsTable').post(validateApiRequest(), trackApiUsage, upload.any(), SeriesController.getPointTableBySeriesId);
router.route('/seriesFinishedMatches').post(validateApiRequest(), trackApiUsage, upload.any(), SeriesController.getSeriesFinishedMatches);
router.route('/getFixtures').get(validateApiRequest(), trackApiUsage, SeriesController.getFixturesMatchesSeriesWise);
router.route('/venuesBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), VenueController.getVenuesBySeriesId);
router.route('/venuesDetail').post(validateApiRequest(), trackApiUsage, upload.any(), VenueController.getVenuesDetailsId);


// News-related routes
router.route('/news').get(validateApiRequest(), trackApiUsage, NewsController.getListWithoutPagination);
router.route('/newsDetail').post(validateApiRequest(), trackApiUsage, upload.any(), NewsController.getByNewsId);
router.route('/newsBySeriesId').post(validateApiRequest(), trackApiUsage, upload.any(), NewsController.getNewsBySeriesId);

// Ranking-related routes
router.route('/playerRanking').post(validateApiRequest(), trackApiUsage, upload.any(), PlayerController.getPlayerRanking);
router.route('/playerInfo').post(validateApiRequest(), trackApiUsage, upload.any(), PlayerController.getByPlyerId);
router.route('/playerList').get(validateApiRequest(), trackApiUsage, PlayerController.getListsForUser);
router.route('/trendingPlayer').get(validateApiRequest(), trackApiUsage, PlayerController.getTrendingPlayerLists);
router.route('/teamRanking').post(validateApiRequest(), trackApiUsage, upload.any(), TeamController.getTeamRanking);

//IPL related routes
router.route('/ipl-auction-overview').get(validateApiRequest(), trackApiUsage, IPLController.getIPLOverview);
router.route('/ipl-auction-players').get(validateApiRequest(), trackApiUsage, IPLController.getLists);
router.route('/iplTeamList').get(validateApiRequest(), trackApiUsage, IPLController.getIPLTeamList);
router.route('/iplTeamDetail/:slug').get(validateApiRequest(), trackApiUsage, IPLController.getIPLTeamDetail);
// router.route('/iplTeamSquads').post(validateApiRequest(), trackApiUsage, upload.any(), TeamController.getIPLTeamSquads);
// router.route('/iplTeamStats').post(validateApiRequest(), trackApiUsage, upload.any(), TeamController.getIPLTeamStats);

module.exports = router;
