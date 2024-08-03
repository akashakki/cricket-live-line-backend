const { TeamsModel } = require('../models');
const CONSTANT = require('../config/constant');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.player_id && await TeamsModel.isFieldValueTaken('player_id', requestBody.player_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Player Id ${requestBody.player_id} already exists.` };
    }
    if (requestBody.name && await TeamsModel.isFieldValueTaken('name', requestBody.name)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${requestBody.name} already exists.` };
    }
    const data = await TeamsModel.create(requestBody);
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
    const data = await TeamsModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await TeamsModel.findById(id)
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
    if (updateBody.player_id && await TeamsModel.isFieldValueTaken('player_id', updateBody.player_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Player Id ${updateBody.player_id} already exists.` };
    }
    if (updateBody.name && await TeamsModel.isFieldValueTaken('name', updateBody.name, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${updateBody.name} already exists.` };
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
    let query = TeamsModel.find(condition);

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
