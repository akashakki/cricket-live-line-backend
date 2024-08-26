const { SportsModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.sport_id && await SportsModel.isFieldValueTaken('sport_id', requestBody.sport_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Sport Id ${requestBody.sport_id} already exists.` };
    }
    if (requestBody.name && await SportsModel.isFieldValueTaken('name', requestBody.name)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${requestBody.name} already exists.` };
    }
    const data = await SportsModel.create(requestBody);
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
    const data = await SportsModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await SportsModel.findById(id)
    return data;
};

/**
 * Update data by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<data>}
 */
const updateById = async (id, updateBody) => {
    const data = await getById(id);
    if (updateBody.sport_id && await SportsModel.isFieldValueTaken('sport_id', updateBody.sport_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Sport Id ${updateBody.sport_id} already exists.` };
    }
    if (updateBody.name && await SportsModel.isFieldValueTaken('name', updateBody.name, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${updateBody.name} already exists.` };
    }
    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UPDATED };
};

/**
 * Delete data by id
 * @param {ObjectId} id
 * @returns {Promise<data>}
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
    let query = SportsModel.find(condition);

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const data = await query.exec();
    return data;
};

module.exports = {
    create,
    queries,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination
};
