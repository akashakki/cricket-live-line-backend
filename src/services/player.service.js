const { PlayerModel, PlayerXiModel } = require('../models');
const CONSTANT = require('../config/constant');
const GlobalService = require('./global.service');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.player_id && await PlayerModel.isFieldValueTaken('player_id', requestBody.player_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Player Id ${requestBody.player_id} already exists.` };
    }
    if (requestBody.name && await PlayerModel.isFieldValueTaken('name', requestBody.name)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${requestBody.name} already exists.` };
    }
    const data = await PlayerModel.create(requestBody);
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

    if (options.play_role && options.play_role != 'undefined') {
        condition.$and.push({
            $or: [{
                play_role: options.play_role
            }]
        })
    }

    if (options.nationality && options.nationality != 'undefined') {
        condition.$and.push({
            $or: [{
                player_team_name_short: options.nationality
            }]
        })
    }

    options['sort'] = { createdAt: -1 };
    if (options?.for == 'user') {
        options['select'] = 'player_id play_role name player_team_flag player_team_name player_team_name_short birth_place born height image'
    }
    const data = await PlayerModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await PlayerModel.findById(id)
    return data;
};

const getByPlyerId = async (player_id) => {
    var data = await PlayerModel.findOne({ player_id: player_id })
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
    if (updateBody.player_id && await PlayerModel.isFieldValueTaken('player_id', updateBody.player_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Player Id ${updateBody.player_id} already exists.` };
    }
    if (updateBody.name && await PlayerModel.isFieldValueTaken('name', updateBody.name, id)) {
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
    data.is_delete = 0;
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DELETED }
};

const getListWithoutPagination = async (options) => {
    var condition = { $and: [{ is_delete: 1 }] };
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
    let query = PlayerModel.find(condition);

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const Industry = await query.exec();
    return Industry;
};

const getTrendingPlayer = async () => {
    var data = await PlayerModel.find({ is_delete: 1, isTrending: true }).select('player_id play_role name player_team_flag player_team_name player_team_name_short birth_place born height image')
    return data;
};

const getPlayingXiUsingMatchId = async (req) => {
    try {
        const data = await PlayerXiModel.findOne({ match_id: req.body.match_id });
 
        if (data) {
            return data;
        } else {
            const result = await GlobalService.globalFunctionFetchDataFromAPI('match_id', req.body.match_id, 'playingXiByMatchId', 'post');
            
            if (result) {
                result['match_id'] = req.body.match_id;
                const data = await PlayerXiModel.create(result);
                return data;
            }
        }
    } catch (error) {
        console.error('Error fetching playing XI:', error);
        return error;
    }
 };

module.exports = {
    create,
    queries,
    getById,
    getByPlyerId,
    updateById,
    deleteById,
    getListWithoutPagination,
    getTrendingPlayer,
    getPlayingXiUsingMatchId
};
