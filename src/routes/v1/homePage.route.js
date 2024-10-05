// const express = require('express');
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });

// const { MatchController, SeriesController, NewsController } = require('../../controllers');

// const router = express.Router();

// router.route('/homeList').get(MatchController.getHomeLists)

// router.route('/matchInfo').get(MatchController.getMatchInfo)

// router.route('/seriesList').get(SeriesController.getSeriesLists)
// router.route('/seriesDetails/:id').get(SeriesController.getBySeriesId)

// router.route('/recentMatchesBySeriesId').post(upload.any(), MatchController.getRecentMatchesBySeriesId)
// router.route('/upcomingMatchesBySeriesId').post(upload.any(), MatchController.getUpcomingMatchesBySeriesId)
// router.route('/newsBySeriesId').post(upload.any(), NewsController.getNewsBySeriesId)
// router.route('/news').get(NewsController.getListWithoutPagination)
// router.route('/newsDetail').post(upload.any(), NewsController.getByNewsId)

// module.exports = router;
const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { MatchController, SeriesController, NewsController, VenueController, PlayerController, TeamController } = require('../../controllers');

const router = express.Router();

// Match-related routes
router.route('/homeList').get(MatchController.getHomeLists);
router.route('/matchInfo').post(upload.any(), MatchController.getMatchInfo);
router.route('/liveMatch').post(upload.any(), MatchController.getLiveMatch);
router.route('/matchBallByBall').post(upload.any(), MatchController.getMatchBallByBallOddHistory);
router.route('/commentary').post(upload.any(), MatchController.getBallByBallLiveMatch);
router.route('/manOfTheMatch').post(upload.any(), MatchController.getManOfTheMatch);
router.route('/scorecardByMatchId').post(upload.any(), MatchController.getScorecardByMatchId);
router.route('/squadsByMatchId').post(upload.any(), MatchController.getSquadsByMatchId);
router.route('/upcomingMatches').get(MatchController.getUpcomingMatches);
router.route('/liveMatchList').get(MatchController.getLiveMatchList);

// Series-related routes
router.route('/seriesList').get(SeriesController.getSeriesLists);
router.route('/seriesDetails/:id').get(SeriesController.getBySeriesId);
router.route('/upcomingMatchesBySeriesId').post(upload.any(), MatchController.getUpcomingMatchesBySeriesId);
router.route('/recentMatchesBySeriesId').post(upload.any(), MatchController.getRecentMatchesBySeriesId);
router.route('/squadsBySeriesId').post(upload.any(), SeriesController.getSquadsBySeriesId);
router.route('/seriesStatsBySeriesId').post(upload.any(), SeriesController.getStatsBySeriesId);
router.route('/pointsTable').post(upload.any(), SeriesController.getPointTableBySeriesId);
router.route('/venuesBySeriesId').post(VenueController.getVenuesBySeriesId);
router.route('/venuesDetail').post(VenueController.getVenuesDetailsId);

// News-related routes
router.route('/news').get(NewsController.getListWithoutPagination);
router.route('/newsDetail').post(upload.any(), NewsController.getByNewsId);
router.route('/newsBySeriesId').post(upload.any(), NewsController.getNewsBySeriesId);

// Ranking-related routes
router.route('/playerRanking').post(upload.any(), PlayerController.getPlayerRanking);
router.route('/playerInfo').post(upload.any(), PlayerController.getByPlyerId);
router.route('/playerList').get(PlayerController.getListsForUser);
router.route('/trendingPlayer').get(PlayerController.getTrendingPlayerLists);
router.route('/teamRanking').post(upload.any(), TeamController.getTeamRanking);

module.exports = router;
