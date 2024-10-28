const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { VenueService, GlobalService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const industry = await VenueService.create(req.body);
    res.send(industry);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await VenueService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const industry = await VenueService.getById(req.params.id);
    if (!industry) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: industry, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const industry = await VenueService.updateById(req.params.id, req.body);
    res.send(industry);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await VenueService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await VenueService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getVenuesBySeriesId = catchAsync(async (req, res) => {
    const { series_id } = req.body;
    const result = await GlobalService.globalFunctionFetchDataFromAPI('series_id', series_id, 'venuesBySeriesId', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getVenuesDetailsId = catchAsync(async (req, res) => {
    const { venue_id } = req.body;
    const result = await GlobalService.globalFunctionFetchDataFromAPI('venue_id', venue_id, 'venuesDetail', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

module.exports = {
    create,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination,
    getVenuesBySeriesId,
    getVenuesDetailsId
};
