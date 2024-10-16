const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { OodSeriesService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const data = await OodSeriesService.create(req.body);
    res.send(data);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status', 'series_id', 'sport_id']);
    const result = await OodSeriesService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getSeriesList = catchAsync(async (req, res) => {
    let sport_id = req.query?.sport_id ? req.query?.sport_id : 4;
    // console.log("🚀 ~ file: oodSeries.controller.js:19 ~ getSeriesList ~ sport_id:", sport_id)
    const data = await OodSeriesService.getSeriesList(sport_id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const getByMatchId = catchAsync(async (req, res) => {
    const data = await OodSeriesService.getByMatchId(req.params.match_id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const getSessionByMatchId = catchAsync(async (req, res) => {
    const data = await OodSeriesService.getMatchSessionByMatchId(req.params.match_id);
    if (!data) {
        res.send({ data: [], code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
    }
});

const getById = catchAsync(async (req, res) => {
    const data = await OodSeriesService.getById(req.params.match_id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const data = await OodSeriesService.updateById(req.params.id, req.body);
    res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await OodSeriesService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await OodSeriesService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});


const getMatchScoreByMatchId = catchAsync(async (req, res) => {
    const data = await OodSeriesService.getMatchScoreByMatchId(req.params.match_id);
    if (!data) {
        res.send({ data: [], code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    } else {
        res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
    }
});

module.exports = {
    create,
    getLists,
    getSeriesList,
    getById,
    getByMatchId,
    getSessionByMatchId,
    updateById,
    deleteById,
    getListWithoutPagination,
    getMatchScoreByMatchId
};
