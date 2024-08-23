const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { MatchController, SeriesController, NewsController } = require('../../controllers');

const router = express.Router();

router.route('/homeList').get(MatchController.getHomeLists)

router.route('/seriesList').get(SeriesController.getSeriesLists)
router.route('/seriesDetails/:id').get(SeriesController.getBySeriesId)

router.route('/recentMatchesBySeriesId').post(upload.any(), MatchController.getRecentMatchesBySeriesId)
router.route('/upcomingMatchesBySeriesId').post(upload.any(), MatchController.getUpcomingMatchesBySeriesId)
router.route('/newsBySeriesId').post(upload.any(), NewsController.getNewsBySeriesId)
router.route('/news').get(NewsController.getListWithoutPagination)
router.route('/newsDetail').post(upload.any(), NewsController.getByNewsId)

module.exports = router;