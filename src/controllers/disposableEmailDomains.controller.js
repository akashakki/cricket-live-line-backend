const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { DisposableEmailService } = require('../services');
const CONSTANT = require('../config/constant');

const create = catchAsync(async (req, res) => {
  const data = await DisposableEmailService.create(req.body);
  res.send(data);
});

const getList = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page','status', 'searchBy']);
  const result = await DisposableEmailService.query(options);
  res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
  const data = await DisposableEmailService.getById(req.params.id);
  if (!data) {
    res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND });
  } else {
    res.send({ data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
  }
});

const updateById = catchAsync(async (req, res) => {
  const data = await DisposableEmailService.updateById(req.params.id, req.body);
  res.send(data);
});

const deleteById = catchAsync(async (req, res) => {
  var details = await DisposableEmailService.deleteById(req.params.id);
  if (details) {
    res.send(details);
  } else {
    res.send(details);
  }
});

module.exports = {
  create,
  getList,
  getById,
  updateById,
  deleteById,
};
