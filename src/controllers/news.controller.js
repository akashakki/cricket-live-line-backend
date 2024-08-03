const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { NewsService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
    const industry = await NewsService.create(req.body);
    res.send(industry);
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await NewsService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const industry = await NewsService.getById(req.params.id);
    if (!industry) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: industry, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const industry = await NewsService.updateById(req.params.id, req.body);
    res.send(industry);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await NewsService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await NewsService.getListWithoutPagination(options);
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
