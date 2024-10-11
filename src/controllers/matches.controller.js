const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { MatchService, GlobalService } = require('../services');
const CONSTANT = require('../config/constant');
// const heroAPIBaseURL = 'https://app.heroliveline.com/csadmin/api/';
// const axios = require('axios');

const create = catchAsync(async (req, res) => {
    const industry = await MatchService.create(req.body);
    res.send(industry);
});

const getHomeLists = catchAsync(async (req, res) => {
    const result = await MatchService.queriesForHomeList();
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getLists = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await MatchService.queries(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getById = catchAsync(async (req, res) => {
    const industry = await MatchService.getById(req.params.id);
    if (!industry) {
        res.send({ data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG });
    }
    res.send({ data: industry, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DETAILS });
});

const updateById = catchAsync(async (req, res) => {
    const industry = await MatchService.updateById(req.params.id, req.body);
    res.send(industry);
});

const deleteById = catchAsync(async (req, res) => {
    var details = await MatchService.deleteById(req.params.id);
    if (details) {
        res.send(details);
    }
    res.send(details);
});

const getListWithoutPagination = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchBy', 'status']);
    const result = await MatchService.getListWithoutPagination(options);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getRecentMatchesBySeriesId = catchAsync(async (req, res) => {
    // const result = await MatchService.getRecentMatchesBySeriesId(req.body.series_id);
    const result = await GlobalService.globalFunctionFetchDataFromAPI('series_id', req.body.series_id, 'recentMatchesBySeriesId', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
})

const getUpcomingMatchesBySeriesId = catchAsync(async (req, res) => {
    // const result = await MatchService.getUpcomingMatchesBySeriesId(req.body.series_id);
    const result = await GlobalService.globalFunctionFetchDataFromAPI('series_id', req.body.series_id, 'upcomingMatchesBySeriesId', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
})

const getMatchInfo = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    // Logic for fetching match info by match_id
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getLiveMatch = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    // Logic for fetching match info by match_id
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getBallByBallLiveMatch = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    // Logic for fetching match info by match_id
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getManOfTheMatch = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const apiResponse = await GlobalService.globalFunctionFetchDataFromAPI('match_id', match_id, 'manOfTheMatch', 'post');
    // Logic for fetching match info by match_id
    res.send({ data: apiResponse, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});


const getScorecardByMatchId = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    // Logic for fetching match info by match_id
    res.send({
        data: {
            result: result?.result,
            is_hundred: result?.is_hundred,
            scorecard: result?.scorecard
        }, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST
    });
});


const getSquadsByMatchId = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    // Logic for fetching match info by match_id
    res.send({ data: result?.squad, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getUpcomingMatches = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getLiveMatchList = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await MatchService.getByMatchId(match_id);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getMatchBallByBallOddHistory = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const hero_match_id = await fetchMatchDetailsFromHero(match_id);
    const result = await fetchBallByBallMatchDetailsFromHero(hero_match_id);
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getMatchLiveBulkInfo = catchAsync(async (req, res) => {
    const { match_ids } = req.body;
    const result = await GlobalService.globalFunctionFetchDataFromHeroPostMethod({match_ids}, 'cron/matchLiveBulkInfo', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
    // Logic for fetching match info by match_id
});

async function fetchMatchDetailsFromHero(match_id) {
    try {
        const response = await GlobalService.globalFunctionFetchDataFromHeroPostMethod({ "match_status": 'All' }, 'web/getmatchlisting', 'post');
        const matchData = response?.matchData;
        let hero_match_id = match_id;
        for (let i = 0; i < matchData.length; i++) {
            const element = matchData[i];
            console.log("🚀 ~ file: matches.controller.js:155 ~ fetchMatchDetailsFromHero ~ element?.match_api_id:", element?.match_api_id)
            if (element?.match_api_id?.toString() == match_id?.toString()) {
                hero_match_id = element?.match_id
            }
        }
        return hero_match_id

    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchBallByBallMatchDetailsFromHero(match_id) {
    try {
        const response = await GlobalService.globalFunctionFetchDataFromHeroPostMethod({ "match_id": match_id }, 'web/match/matchBallByBall', 'post');
        return response?.matchOddHistoryData

    } catch (error) {
        console.error('Error making API call:', error);
    }
}

const getMatchCommentary = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await GlobalService.globalFunctionFetchDataFromAPI('match_id', match_id, 'commentary', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

const getliveMatch = catchAsync(async (req, res) => {
    const { match_id } = req.body;
    const result = await GlobalService.globalFunctionFetchDataFromAPI('match_id', match_id, 'liveMatch', 'post');
    res.send({ data: result, code: CONSTANT.SUCCESSFUL, message: CONSTANT.LIST });
});

module.exports = {
    create,
    getHomeLists,
    getLists,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination,
    getRecentMatchesBySeriesId,
    getUpcomingMatchesBySeriesId,
    getMatchInfo,
    getLiveMatch,
    getBallByBallLiveMatch,
    getMatchCommentary,
    getliveMatch,
    getManOfTheMatch,
    getScorecardByMatchId,
    getSquadsByMatchId,
    getUpcomingMatches,
    getLiveMatchList,
    getMatchBallByBallOddHistory,
    getMatchLiveBulkInfo
};
