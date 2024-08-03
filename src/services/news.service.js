const { NewsModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.news_id && await NewsModel.isFieldValueTaken('news_id', requestBody.news_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `News ID ${requestBody.news_id} already exists.` };
    }
    if (requestBody.title && await NewsModel.isFieldValueTaken('title', requestBody.title)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Title - ${requestBody.title} already exists.` };
    }
    const data = await NewsModel.create(requestBody);
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
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                title: searchBy
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
    const data = await NewsModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await NewsModel.findById(id)
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
    if (updateBody.news_id && await NewsModel.isFieldValueTaken('news_id', updateBody.news_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `News ID ${updateBody.news_id} already exists.` };
    }
    if (updateBody.title && await NewsModel.isFieldValueTaken('title', updateBody.title, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Title - ${updateBody.title} already exists.` };
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
    let query = NewsModel.find(condition);

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
    updateById,
    deleteById,
    getListWithoutPagination
};
