const { ReviewModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Review
 * @param {Object} requestBody
 * @returns {Promise<Review>}
 */
const createReview = async (requestBody) => {
    const data = await ReviewModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.REVIEW_CREATE };
};

/**
 * Query for Reviews
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryReview = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };

    if (options.searchBy && options.searchBy != 'undefined') {
        condition.$and.push({
            $or: [{
                question: {
                    $regex: '.*' + options.searchBy + '.*',
                    $options: 'si',
                }
            }]
        });
    }
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{ status: options.status }]
        });
    }
    options['sort'] = { createdAt: -1 };

    const data = await ReviewModel.paginate(condition, options);
    return data;
};

/**
 * Get Review by id
 * @param {ObjectId} id
 * @returns {Promise<Review>}
 */
const getReviewById = async (id) => {
    return await ReviewModel.findById(id);
};

/**
 * Get Review by id
 * @param {ObjectId} id
 * @returns {Promise<Review>}
 */
const getReviewByIdWithPopulate = async (value, type) => {
    console.log("🚀 ~ file: Review.service.js:66 ~ getReviewByIdWithPopulate ~ value:", value)
    const conditions = {};
    if (type == 'id') {
        conditions['_id'] = value;
    } else if (type == 'slug') {
        conditions['slug'] = value;
    }
    return await ReviewModel.findOne(conditions);
};

/**
 * Get Review by category
 * @param {ObjectId} category
 * @returns {Promise<Review>}
 */
const getReviewByCategory = async (id) => {
    return await ReviewModel.find({ category: id, isDelete: 1 });
};

/**
 * Update Review by id
 * @param {ObjectId} reviewId
 * @param {Object} updateBody
 * @returns {Promise<Review>}
 */
const updateReviewById = async (reviewId, updateBody) => {
    const data = await getReviewById(reviewId);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.REVIEW_NOT_FOUND };
    }

    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_UPDATE };
};

/**
 * Delete Review by id
 * @param {ObjectId} reviewId
 * @returns {Promise<Review>}
 */
const deleteReviewById = async (reviewId) => {
    const data = await getReviewById(reviewId);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.REVIEW_NOT_FOUND };
    }
    data.isDelete = 0;
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.REVIEW_DELETE };
};

/**
 * Query for Review
 * @param {Object} options - Query options
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queryReviewWithoutPagination = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };
    let sorting = {}
    // var condition = {};
    if (options.searchBy && options.searchBy != 'undefined') {
        condition['question'] = {
            $regex: '.*' + options.searchBy + '.*',
            $options: 'si',
        };
    }


    if (options.status && options.status != 'undefined') {
        condition['status'] = options.status;
    }

    sorting = { createdAt: -1 };

    const data = await ReviewModel.find(condition).sort(sorting);
    return data;
};

module.exports = {
    createReview,
    queryReview,
    getReviewById,
    getReviewByCategory,
    updateReviewById,
    deleteReviewById,
    getReviewByIdWithPopulate,
    queryReviewWithoutPagination
};
