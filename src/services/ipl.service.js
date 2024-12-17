const { IPLAuctionPlayerModel, IPLTeamsModel, IPLOverviewModel } = require('../models');
const CONSTANT = require('../config/constant');

const getIPLOverview = async () => {
    try {
        // Fetch IPL overview data
        const overview = await IPLOverviewModel.findOne();
        const apiResponse = JSON.parse(overview.apiResponse);
        // let allRounderPlayerIds = apiResponse.aTopAllRounderData.map(item => item._id);
        // console.log("🚀 ~ file: ipl.service.js:10 ~ getIPLOverview ~ allRounderPlayerIds:", allRounderPlayerIds);

        // Fetch Top Picks: 6 players with highest SoldPrice and auctionStatus 'Sold'
        const topsPicks = await IPLAuctionPlayerModel.find({ auctionStatus: 'Sold', isCappedPlayer: true })
            .sort({ soldPrice: -1 })
            .limit(6);

        // Fetch Top All-Rounders: 6 players with highest soldPrice, auctionStatus 'Sold', and playingRole 'all'
        const TopAllRounderData = await IPLAuctionPlayerModel.find({
            auctionStatus: { $in: ['Sold', 'Retained'] }, isCappedPlayer: true,
            playingRole: 'all'
        }).sort({ soldPrice: -1 })
            .limit(6);

        // Fetch Top Batters: 6 players with highest soldPrice, auctionStatus 'Sold', and playingRole 'bat'
        const TopBatterData = await IPLAuctionPlayerModel.find({
            auctionStatus: { $in: ['Sold', 'Retained'] }, isCappedPlayer: true,
            playingRole: 'bat'
        }).sort({ soldPrice: -1 })
            .limit(6);

        // Fetch Top Bowlers: 6 players with highest soldPrice, auctionStatus 'Sold', and playingRole 'bowl'
        const TopBowlerData = await IPLAuctionPlayerModel.find({
            auctionStatus: { $in: ['Sold', 'Retained'] }, isCappedPlayer: true,
            playingRole: 'bowl'
        }).sort({ soldPrice: -1 })
            .limit(6);

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
