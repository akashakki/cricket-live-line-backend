const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { SeriesService, GlobalService } = require('../services');
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
    let response = [];
    const { series_id } = req.body;
    response = await GlobalService.globalFunctionFetchDataFromAPI('series_id', series_id, 'squadsBySeriesId', 'post');
    if (response?.length == 0) {
        const data = await SeriesService.getBySeriesId(series_id);
        const updated_series_id = data?.series?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const result = await GlobalService.globalFunctionFetchDataFromHeroPostMethod({ "series_id": updated_series_id }, 'web/series/seriesDetail', 'post');
        response = result?.seriesDetail?.series_players?.data;
    }
    res.send({ data: response, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getStatsBySeriesId = catchAsync(async (req, res) => {
    const { series_id, type, sub_type } = req.body;
    const params = {
        series_id,
        type,
        sub_type
    }
    const response = await GlobalService.globalFunctionFetchDataFromAPI('multiple', params, 'seriesStatsBySeriesId', 'post');
    res.send({ data: response, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getPointTableBySeriesId = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    const response = await GlobalService.globalFunctionFetchDataFromAPI('series_id', series_id, 'pointsTable', 'post');
    res.send({ data: response, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getSeriesFinishedMatches = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    const response = await GlobalService.globalFunctionFetchDataFromHeroPostMethod({ "series_cid": series_id?.toString() }, 'web/series/seriesFinishedMatches', 'post');
    // console.log("🚀 ~ file: series.controller.js:75 ~ getSeriesFinishedMatches ~ response:", response)
    res.send({ data: response?.resData, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
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
    getPointTableBySeriesId,
    getSeriesFinishedMatches
};
