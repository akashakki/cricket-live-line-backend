const { IPLAuctionPlayerModel, IPLTeamsModel, IPLOverviewModel } = require('../models');
const CONSTANT = require('../config/constant');

const getIPLOverview = async () => {
    try {
        // Fetch IPL overview data
        const overview = await IPLOverviewModel.findOne().lean(); // Use lean for better performance
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
                .limit(6),
                // .select('name image soldPrice playingRole iplTeamImage iplTeamName_short countryName countryFlag apiPlayerId'),

            // Fetch Top All-Rounders
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'all',
                apiPlayerId: { $in: allRounderPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6),
                // .select('name image soldPrice playingRole iplTeamImage iplTeamName_short countryName countryFlag apiPlayerId'),

            // Fetch Top Batters
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'bat',
                apiPlayerId: { $in: allBattersPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6),
                // .select('name image soldPrice playingRole iplTeamImage iplTeamName_short countryName countryFlag apiPlayerId'),

            // Fetch Top Bowlers
            IPLAuctionPlayerModel.find({
                ...commonCondition,
                playingRole: 'bowl',
                apiPlayerId: { $in: allBowlerPlayerIds }
            })
                .sort({ soldPrice: -1 })
                .limit(6)
                // .select('name image soldPrice playingRole iplTeamImage iplTeamName_short countryName countryFlag apiPlayerId')
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

module.exports = {
    getIPLOverview,
};
