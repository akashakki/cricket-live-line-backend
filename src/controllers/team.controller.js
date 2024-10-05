const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { TeamService } = require('../services');
const CONSTANT = require('../config/constant');
const heroAPIBaseURL = 'https://app.heroliveline.com/csadmin/api/';
const baseURL = 'https://apicricketchampion.in/apiv4/';
const token = 'deed03c60ab1c13b1dbef6453421ead6';
const axios = require('axios');
const FormData = require('form-data');

const create = catchAsync(async (req, res) => {
    const industry = await TeamService.create(req.body);
    res.send(industry);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await TeamService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const industry = await TeamService.getById(req.params.id);
    if (!industry) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: industry, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const industry = await TeamService.updateById(req.params.id, req.body);
    res.send(industry);
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
    const { type } = req.body;
    const result = await fetchTeamRanking(type);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

async function fetchTeamRanking(type) {
    try {
        const formData = new FormData();
        formData.append('type', type); // Add match_id to formdata

        let config = {
            method: 'post',
            maxBodyLength: Infinity, // Allow large request bodies if needed
            url: `${baseURL}teamRanking/${token}`, // Your API endpoint
            headers: {
                ...formData.getHeaders() // Ensure correct headers for FormData, including Content-Type
            },
            data: formData // Send the FormData object as the request body
        };

        const response = await axios.request(config);
        const data = response.data?.data;
        return data;
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

module.exports = {
    create,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination,
    getTeamRanking
};
