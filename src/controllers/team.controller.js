const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { TeamService, GlobalService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const data = await TeamService.create(req.body);
    res.send(data);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await TeamService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const data = await TeamService.getById(req.params.id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const data = await TeamService.updateById(req.params.id, req.body);
    res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await TeamService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await TeamService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getTeamRanking = catchAsync(async (req, res) => {
    const { type, teamType } = req.body;
    let apiResponse = [];
    // const result = await fetchTeamRanking(type);
    if (teamType == 'men') {
        apiResponse = await GlobalService.globalFunctionFetchDataFromAPI('type', type, 'teamRanking', 'post');
    } else {
        let result = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(`web/rankingData/${type}/2`);
        const newArray = result?.data?.map(item => ({
            rank: Number(item.pt_rank), // Convert to number if needed
            team: item.pt_team,
            image: item.pt_image,
            rating: Number(item.pt_rating), // Convert to number if needed
            point: Number(item.pt_point) // Convert to number if needed
          }));
          apiResponse = newArray
    }
    res.send({ data: apiResponse, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

// async function fetchTeamRanking(type) {
//     try {
//         const formData = new FormData();
//         formData.append('type', type); // Add match_id to formdata

//         let config = {
//             method: 'post',
//             maxBodyLength: Infinity, // Allow large request bodies if needed
//             url: `${baseURL}teamRanking/${token}`, // Your API endpoint
//             headers: {
//                 ...formData.getHeaders() // Ensure correct headers for FormData, including Content-Type
//             },
//             data: formData // Send the FormData object as the request body
//         };

//         const response = await axios.request(config);
//         const data = response.data?.data;
//         return data;
//     } catch (error) {
//         console.error('Error making API call:', error);
//     }
// }

module.exports = {
    create,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination,
    getTeamRanking
};
