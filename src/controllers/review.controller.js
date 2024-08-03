const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { ReviewService } = require('../services');
const CONSTANT = require('../config/constant');

const createReview = catchAsync(async (req, res) => {
    var data = await ReviewService.createReview(req.body);
    res.send(data);
});

const getReviews = catchAsync(async (req, res) => {
    const options = pick(req.query, [
        'sortBy',
        'limit',
        'page',
        'searchBy',
        'reviewId',
        'status'
    ]);
    // options['userType'] = req.user.userType;
    const result = await ReviewService.queryReview(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_LIST });
});

const getReview = catchAsync(async (req, res) => {
    const data = await ReviewService.getReviewByIdWithPopulate(req.params.reviewId, 'id');
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.REVIEW_NOT_FOUND });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_DETAILS });
    }
});

const getReviewByCategory = catchAsync(async (req, res) => {
    const data = await ReviewService.getReviewByCategory(req.params.categoryId);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.REVIEW_NOT_FOUND });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_DETAILS });
    }
});

const updateReview = catchAsync(async (req, res) => {
    var data = await ReviewService.updateReviewById(req.params.reviewId, req.body)
    res.send(data);
});

const deleteReview = catchAsync(async (req, res) => {
    var details = await ReviewService.deleteReviewById(req.params.reviewId, req.user);
    if (details) {
        res.send(details);
    } else {
        res.send(details);
    }
});

const getReviewsWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['searchBy', 'status']);

    // options['userType'] = req.user.userType;
    const result = await ReviewService.queryReviewWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_LIST });
});



module.exports = {
    createReview,
    getReviews,
    getReview,
    getReviewByCategory,
    updateReview,
    deleteReview,
    getReviewsWithoutPagination
};
