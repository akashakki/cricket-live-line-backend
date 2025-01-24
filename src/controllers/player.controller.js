const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { PlayerService, GlobalService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const data = await PlayerService.create(req.body);
    res.send(data);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status', 'nationality', 'play_role']);
    const result = await PlayerService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getListsForUser = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status', 'nationality', 'play_role']);
    options['for'] = 'user';
    const result = await PlayerService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getTrendingPlayerLists = catchAsync(async (req, res) => {
    const result = await PlayerService.getTrendingPlayer();
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getPlayingXiByMatchId = catchAsync(async (req, res) => {
    const result = await PlayerService.getPlayingXiUsingMatchId(req);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const data = await PlayerService.getById(req.params.id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const data = await PlayerService.updateById(req.params.id, req.body);
    res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await PlayerService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await PlayerService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getPlayerRanking = catchAsync(async (req, res) => {
    const { type } = req.body;
    const apiResponse = await GlobalService.globalFunctionFetchDataFromAPI('type', type, 'playerRanking', 'post');
    res.send({ data: apiResponse, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getByPlyerId = catchAsync(async (req, res) => {
    const { player_id } = req.body;
    const data = await PlayerService.getByPlyerId(player_id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

async function fetchPlayerRanking(type) {
    try {
        const formData = new FormData();
        formData.append('type', type); // Add match_id to formdata

        let config = {
            method: 'post',
            maxBodyLength: Infinity, // Allow large request bodies if needed
            url: `${baseURL}playerRanking/${token}`, // Your API endpoint
            headers: {
                ...formData.getHeaders() // Ensure correct headers for FormData, including Content-Type
            },
            data: formData // Send the FormData object as the request body
        };

        const response = await axios.request(config);
        const data = response.data?.data;
        return data;
    } catch (error) {
        console.error('Error making API call plyers controller:', error);
    }
}

module.exports = {
    create,
    getLists,
    getListsForUser,
    getById,
    getByPlyerId,
    updateById,
    deleteById,
    getListWithoutPagination,
    getPlayerRanking,
    getTrendingPlayerLists,
    getPlayingXiByMatchId
};
