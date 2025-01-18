const { SeriesModel } = require('../models');
const CONSTANT = require('../config/constant');
const moment = require('moment');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.series_id && await SeriesModel.isFieldValueTaken('series_id', requestBody.series_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series ID ${requestBody.series_id} already exists.` };
    }
    if (requestBody.series && await SeriesModel.isFieldValueTaken('series', requestBody.series)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Series ${requestBody.series} already exists.` };
    }
    const data = await SeriesModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.CREATED };
};

const getSeriesList = async () => {
    var data = await SeriesModel.find({})
    return data;
};


const getSeriesListDateWise = async (requestBody) => {
    let startDate, endDate;

    if (requestBody && requestBody.date) {
        const providedDate = moment(new Date(requestBody.date));
        startDate = providedDate.subtract(5, 'days').startOf('day').utc().toDate();
        endDate = providedDate.add(10, 'days').startOf('day').utc().toDate();
    } else {
        startDate = moment().startOf('month').utc().toDate();
        endDate = moment().endOf('month').utc().toDate();
    }

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    let data = await SeriesModel.find({
        start_date: { $gte: new Date(startDate) },
        end_date: { $lte: new Date(endDate) }
    });

    console.log("🚀 ~ file: series.service.js:47 ~ getSeriesListDateWise ~ data.length:", data.length)
    if (data.length === 0) {
        endDate = moment(endDate).add(15, 'days').utc().toDate();
        data = await SeriesModel.find({
            start_date: { $gte: new Date(startDate) },
            end_date: { $lte: new Date(endDate) }
        });
    }

    return data;
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
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                series: searchBy
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
    const data = await SeriesModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await SeriesModel.findById(id)
    return data;
};

/**
 * Get Record by Series_id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getBySeriesId = async (id) => {
    var data = await SeriesModel.findOne({ series_id: id })
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
    if (updateBody.series_id && await SeriesModel.isFieldValueTaken('series_id', updateBody.series_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.ALREADY_EXISTS };
    }
    if (updateBody.series && await SeriesModel.isFieldValueTaken('series', updateBody.series, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: CONSTANT.ALREADY_EXISTS };
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
    console.log("🚀 ~ file: series.service.js:143 ~ getListWithoutPagination ~ options:", options)
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
    let query = SeriesModel.find(condition);

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const Industry = await query.exec();
    return Industry;
};

module.exports = {
    create,
    queries,
    getSeriesList,
    getSeriesListDateWise,
    getById,
    getBySeriesId,
    updateById,
    deleteById,
    getListWithoutPagination
};
