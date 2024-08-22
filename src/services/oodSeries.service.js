const { OodSeriesModel, MatchesRunnerModel, MatchesSessionModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.series_id && await OodSeriesModel.isFieldValueTaken('series_id', requestBody.series_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series Id ${requestBody.series_id} already exists.` };
    }
    if (requestBody.name && await OodSeriesModel.isFieldValueTaken('name', requestBody.name)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series Name - ${requestBody.name} already exists.` };
    }
    const data = await OodSeriesModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.CREATED };
};

/**
 * Query for Record
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queries = async (options) => {
    var condition = { $and: [{ is_delete: 1 }] };

    // Search condition
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si" // case-insensitive and dot-all
        }
        condition.$and.push({
            $or: [{
                name: searchBy
            }]
        });
    }

    // Status condition
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{
                status: options.status
            }]
        });
    }

    // Series ID condition
    if (options.series_id && options.series_id != 'undefined') {
        condition.$and.push({
            $or: [{
                series_id: options.series_id
            }]
        });
    }

    // Retrieve matches with the condition applied
    const InplayMatches = await OodSeriesModel.find({ ...condition, matchType: 'Inplay' });
    const UpCommingMatches = await OodSeriesModel.find({ ...condition, matchType: 'Upcoming' });

    return { InplayMatches, UpCommingMatches };
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await OodSeriesModel.findById(id)
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getSeriesList = async (id) => {
    const data = await OodSeriesModel.aggregate([
        {
            $match: {
                is_delete: 1 // Only fetch records that are not deleted
            }
        },
        {
            $group: {
                _id: {
                    series_id: "$series_id",
                    seriesName: "$seriesName",
                    sport_id: "$sport_id"
                }
            }
        },
        {
            $project: {
                _id: 0, // Remove the _id field from the output
                series_id: "$_id.series_id",
                seriesName: "$_id.seriesName",
                sport_id: "$_id.sport_id"
            }
        }
    ]);

    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getByMatchId = async (id) => {
    var data = await MatchesRunnerModel.findOne({ matchId: id })
    return data;
};

const getSessionByMatchId = async (id) => {
    var data = await MatchesSessionModel.findOne({ match_id: id })
    return data;
};

const getMatchSessionByMatchId = async (id) => {
    var data = await MatchesSessionModel.find({ match_id: id })
    return data;
};

/**
 * Update industry by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<industry>}
 */
const updateById = async (id, updateBody) => {
    const data = await getById(id);
    if (updateBody.series_id && await OodSeriesModel.isFieldValueTaken('series_id', updateBody.series_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series Id ${updateBody.series_id} already exists.` };
    }
    if (updateBody.name && await OodSeriesModel.isFieldValueTaken('name', updateBody.name, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series Name - ${updateBody.name} already exists.` };
    }
    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UPDATED };
};

/**
 * Delete industry by id
 * @param {ObjectId} id
 * @returns {Promise<industry>}
 */
const deleteById = async (id) => {
    const data = await getById(id);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG }
    }
    data.isDelete = 0;
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DELETED }
};

const getListWithoutPagination = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                name: searchBy
            }]
        })
    }
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{
                status: options.status
            }]
        })
    }
    let query = OodSeriesModel.find(condition);

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const Industry = await query.exec();
    return Industry;
};

module.exports = {
    create,
    queries,
    getById,
    getSeriesList,
    getByMatchId,
    getSessionByMatchId,
    getMatchSessionByMatchId,
    updateById,
    deleteById,
    getListWithoutPagination
};
