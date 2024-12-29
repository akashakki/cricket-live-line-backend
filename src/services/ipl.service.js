const { IPLAuctionPlayerModel, IPLTeamsModel, IPLOverviewModel } = require('../models');
const CONSTANT = require('../config/constant');

let selectedPlayerFields = 'apiPlayerId auctionStatus isCappedPlayer basePrice countryFlag countryName countryName_short image iplTeamImage iplTeamName iplTeamName_short isCappedPlayer isOverseas name playingRole primaryTeamFlag primaryTeamName_short slug soldPrice teamId teamJerseyImage';

const getIPLOverview = async (auctionType) => {
    try {
        // Fetch IPL overview data
        const overview = await IPLOverviewModel.findOne({ auctionType }).lean(); // Use lean for better performance
        if (!overview) throw new Error("No IPL overview data found");

        const apiResponse = JSON.parse(overview.apiResponse);

        // Extract player IDs from API response
        const allRounderPlayerIds = apiResponse.aTopAllRounderData.map(item => item._id);
        const allBattersPlayerIds = apiResponse.aTopBatterData.map(item => item._id);
        const allBowlerPlayerIds = apiResponse.aTopBowlerData.map(item => item._id);

        // Define common conditions
        const commonCondition = { isCappedPlayer: true, auctionStatus: { $in: ['Sold', 'Retained'] } };

        // Run all database queries concurrently
        const [topsPicks, TopAllRounderData, TopBatterData, TopBowlerData] = await Promise.all([
            // Fetch Top Picks: 6 players with highest soldPrice and auctionStatus 'Sold'
            IPLAuctionPlayerModel.find({ ...commonCondition, auctionStatus: 'Sold' })
                .sort({ soldPrice: -1 })
                .limit(6)
                .select(selectedPlayerFields),

            // Fetch Top All-Rounders
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'all',
                apiPlayerId: { $in: allRounderPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6)
                .select(selectedPlayerFields),

            // Fetch Top Batters
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'bat',
                apiPlayerId: { $in: allBattersPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6)
                .select(selectedPlayerFields),

            // Fetch Top Bowlers
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'bowl',
                apiPlayerId: { $in: allBowlerPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6)
                .select(selectedPlayerFields),
        ]);

        // Return all the collected data
        return {
            overview,
            topsPicks,
            TopAllRounderData,
            TopBatterData,
            TopBowlerData,
        };
    } catch (error) {
        console.error("Error fetching IPL Overview data:", error);
        throw error;
    }
};


const queries = async (options) => {
    var condition = { $and: [{ is_delete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                name: searchBy
            }]
        })
    }
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{
                status: options.status
            }]
        })
    }

    if (options.auctionStatus && options.auctionStatus != 'undefined') {
        condition.$and.push({
            $or: [{
                auctionStatus: options.auctionStatus
            }]
        })
    }
    if (options.isCappedPlayer && options.isCappedPlayer != 'undefined') {
        condition.$and.push({
            $or: [{
                isCappedPlayer: options.isCappedPlayer
            }]
        })
    }
    if (options.team && options.team != 'undefined') {
        condition.$and.push({
            $or: [{
                iplTeamName_short: options.team
            }]
        })
    }
    if (options.country && options.country != 'undefined') {
        condition.$and.push({
            $or: [{
                countryName_short: options.country
            }]
        })
    }
    if (options.role && options.role != 'undefined') {
        condition.$and.push({
            $or: [{
                playingRole: options.role
            }]
        })
    }
    options['select'] = selectedPlayerFields;
    const data = await IPLAuctionPlayerModel.paginate(condition, options);
    return data;
};

const getPlayerDetails = async (slug) => {
    const data = await IPLAuctionPlayerModel.findOne({ is_delete: 1, slug }).select(selectedPlayerFields + ' teamsBids').lean();
    return data;
};


const getTeams = async () => {
    const data = await IPLTeamsModel.find({ is_delete: 1 }).select('name shortName purseLeft playerCount overseaPlayerCount slug totalSpend teamId colorCode image').lean();
    return data;
};

const getTeamDetails = async (slug) => {
    const data = await IPLTeamsModel.findOne({ is_delete: 1, slug: slug }).select('name shortName purseLeft playerCount overseaPlayerCount slug totalSpend teamId colorCode image').lean();
    return data;
};

module.exports = {
    getIPLOverview,
    queries,
    getTeams,
    getTeamDetails,
    getPlayerDetails
};
