const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { SeriesService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const data = await SeriesService.create(req.body);
    res.send(data);
});

const getSeriesLists = catchAsync(async (req, res) => {
    const result = await SeriesService.getSeriesList(req);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await SeriesService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const data = await SeriesService.getById(req.params.id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const getBySeriesId = catchAsync(async (req, res) => {
    const data = await SeriesService.getBySeriesId(req.params.id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const data = await SeriesService.updateById(req.params.id, req.body);
    res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await SeriesService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await SeriesService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getSquadsBySeriesId = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    // Logic for fetching match info by match_id
});

const getStatsBySeriesId = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    // Logic for fetching match info by match_id
});

const getPointTableBySeriesId = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    // Logic for fetching match info by match_id
});

module.exports = {
    create,
    getSeriesLists,
    getLists,
    getById,
    getBySeriesId,
    updateById,
    deleteById,
    getListWithoutPagination,
    getSquadsBySeriesId,
    getStatsBySeriesId,
    getPointTableBySeriesId
};
