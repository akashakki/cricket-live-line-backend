const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { IPLService } = require('../services');
const CONSTANT = require('../config/constant');


const getIPLOverview = catchAsync(async (req, res) => {
    const result = await IPLService.getIPLOverview();
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status', 'auctionStatus', 'isCappedPlayer', 'team', 'country', 'role']);
    const result = await IPLService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getIPLTeamList = catchAsync(async (req, res) => {
    const result = await IPLService.getTeams();
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getIPLTeamDetail = catchAsync(async (req, res) => {
    const result = await IPLService.getTeamDetail(req.params.slug);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

module.exports = {
    getIPLOverview,
    getLists,
    getIPLTeamList,
    getIPLTeamDetail
};