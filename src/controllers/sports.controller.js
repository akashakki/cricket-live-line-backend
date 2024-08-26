const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { SportsService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const data = await SportsService.create(req.body);
    res.send(data);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await SportsService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const data = await SportsService.getById(req.params.id);
    if (!data) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const data = await SportsService.updateById(req.params.id, req.body);
    res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await SportsService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await SportsService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

module.exports = {
    create,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination
};
