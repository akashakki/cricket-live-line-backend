const { IPLAuctionPlayerModel, IPLTeamsModel, IPLOverviewModel } = require('../models');
const CONSTANT = require('../config/constant');

const { IPLAuctionPlayerModel, IPLTeamsModel, IPLOverviewModel } = require('../models');
const CONSTANT = require('../config/constant');

const getIPLOverview = async () => {
    try {
        // Fetch IPL overview data
        const overview = await IPLOverviewModel.findOne();

        // Fetch Top Picks: 6 players with highest SoldPrice and auctionStatus 'Sold'
        const topsPicks = await IPLAuctionPlayerModel.find({ auctionStatus: 'Sold' })
            .sort({ SoldPrice: -1 })
            .limit(6);

        // Fetch Top All-Rounders: 6 players with highest SoldPrice, auctionStatus 'Sold', and playingRole 'all'
        const TopAllRounderData = await IPLAuctionPlayerModel.find({
            auctionStatus: 'Sold',
            playingRole: 'all'
        }).sort({ SoldPrice: -1 })
            .limit(6);

        // Fetch Top Batters: 6 players with highest SoldPrice, auctionStatus 'Sold', and playingRole 'bat'
        const TopBatterData = await IPLAuctionPlayerModel.find({
            auctionStatus: 'Sold',
            playingRole: 'bat'
        }).sort({ SoldPrice: -1 })
            .limit(6);

        // Fetch Top Bowlers: 6 players with highest SoldPrice, auctionStatus 'Sold', and playingRole 'bowl'
        const TopBowlerData = await IPLAuctionPlayerModel.find({
            auctionStatus: 'Sold',
            playingRole: 'bowl'
        }).sort({ SoldPrice: -1 })
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
