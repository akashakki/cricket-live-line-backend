const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { PlayerService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const industry = await PlayerService.create(req.body);
    res.send(industry);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await PlayerService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const industry = await PlayerService.getById(req.params.id);
    if (!industry) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: industry, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const industry = await PlayerService.updateById(req.params.id, req.body);
    res.send(industry);
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

module.exports = {
    create,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination
};
