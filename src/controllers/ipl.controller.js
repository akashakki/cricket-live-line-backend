const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { IPLService } = require('../services');
const CONSTANT = require('../config/constant');


const getIPLOverview = catchAsync(async (req, res) => {
    const result = await IPLService.getIPLOverview();
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

module.exports = {
    getIPLOverview
};