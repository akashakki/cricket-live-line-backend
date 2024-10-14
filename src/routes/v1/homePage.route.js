// module.exports = router;
const express = require('express');
const multer = require('multer');
const { validateApiRequest } = require('../../middlewares');
const upload = multer({ storage: multer.memoryStorage() });

const { MatchController, SeriesController, NewsController, VenueController, PlayerController, TeamController } = require('../../controllers');

const router = express.Router();

// Match-related routes
router.route('/homeList').get(validateApiRequest(), MatchController.getHomeLists);
router.route('/matchInfo').post(validateApiRequest(), upload.any(), MatchController.getMatchInfo);
router.route('/matchBallByBall').post(validateApiRequest(), upload.any(), MatchController.getMatchBallByBallOddHistory);
// router.route('/commentary').post(upload.any(), MatchController.getBallByBallLiveMatch);
router.route('/liveMatch').post(validateApiRequest(), upload.any(), MatchController.getliveMatch);
router.route('/commentary').post(validateApiRequest(), upload.any(), MatchController.getMatchCommentary);
router.route('/manOfTheMatch').post(validateApiRequest(), upload.any(), MatchController.getManOfTheMatch);
router.route('/scorecardByMatchId').post(validateApiRequest(), upload.any(), MatchController.getScorecardByMatchId);
router.route('/squadsByMatchId').post(validateApiRequest(), upload.any(), MatchController.getSquadsByMatchId);
router.route('/upcomingMatches').get(validateApiRequest(), MatchController.getUpcomingMatches);
router.route('/liveMatchList').get(validateApiRequest(), MatchController.getLiveMatchList);
router.route('/matchLiveBulkInfo').post(validateApiRequest(), MatchController.getMatchLiveBulkInfo);

// Series-related routes
router.route('/seriesList').get(validateApiRequest(), SeriesController.getSeriesLists);
router.route('/seriesDetails/:id').get(validateApiRequest(), SeriesController.getBySeriesId);
router.route('/upcomingMatchesBySeriesId').post(validateApiRequest(), upload.any(), MatchController.getUpcomingMatchesBySeriesId);
router.route('/recentMatchesBySeriesId').post(validateApiRequest(), upload.any(), MatchController.getRecentMatchesBySeriesId);
router.route('/squadsBySeriesId').post(validateApiRequest(), upload.any(), SeriesController.getSquadsBySeriesId);
router.route('/seriesStatsBySeriesId').post(validateApiRequest(), upload.any(), SeriesController.getStatsBySeriesId);
router.route('/pointsTable').post(validateApiRequest(), upload.any(), SeriesController.getPointTableBySeriesId);
router.route('/seriesFinishedMatches').post(validateApiRequest(), upload.any(), SeriesController.getSeriesFinishedMatches);
router.route('/getFixtures').post(validateApiRequest(), upload.any(), SeriesController.getFixturesMatchesSeriesWise);
router.route('/venuesBySeriesId').post(validateApiRequest(), upload.any(), VenueController.getVenuesBySeriesId);
router.route('/venuesDetail').post(validateApiRequest(), VenueController.getVenuesDetailsId);


// News-related routes
router.route('/news').get(validateApiRequest(), NewsController.getListWithoutPagination);
router.route('/newsDetail').post(validateApiRequest(), upload.any(), NewsController.getByNewsId);
router.route('/newsBySeriesId').post(validateApiRequest(), upload.any(), NewsController.getNewsBySeriesId);

// Ranking-related routes
router.route('/playerRanking').post(validateApiRequest(), upload.any(), PlayerController.getPlayerRanking);
router.route('/playerInfo').post(validateApiRequest(), upload.any(), PlayerController.getByPlyerId);
router.route('/playerList').get(validateApiRequest(), PlayerController.getListsForUser);
router.route('/trendingPlayer').get(validateApiRequest(), PlayerController.getTrendingPlayerLists);
router.route('/teamRanking').post(validateApiRequest(), upload.any(), TeamController.getTeamRanking);

module.exports = router;
